import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LockKeyhole, Sparkles, Users, Search, LogOut, Download, CheckCircle2, ArrowRight, MessageCircle, RefreshCw } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'suporteapp9@gmail.com').toLowerCase().trim();
const CAPACITY = 10;
const TABLE = 'inscricoes_sala_secreta';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const emptyForm = {
  nome: '', email: '', whatsapp: '', perfil: '', experiencia_ia: '',
  ferramentas_utilizadas: '', site: '', objetivo: '', investimento_mensal: '',
  consentimento: false
};

const questions = [
  { name: 'nome', label: 'Nome completo', required: true, placeholder: 'Seu nome e sobrenome' },
  { name: 'email', label: 'E-mail', type: 'email', required: true, placeholder: 'voce@exemplo.com' },
  { name: 'whatsapp', label: 'WhatsApp com DDD', required: true, placeholder: '(41) 99999-9999' },
  { name: 'perfil', label: 'Qual é seu perfil profissional?', required: true, options: ['Empreendedor(a) / dono(a) de negócio', 'Profissional autônomo(a)', 'Gestor(a) / coordenador(a)', 'Profissional de equipe', 'Consultor(a) / prestador(a) de serviços', 'Estou começando um negócio', 'Outro'] },
  { name: 'experiencia_ia', label: 'Como você usa IA hoje?', required: true, options: ['Ainda não uso', 'Já testei, mas uso raramente', 'Uso de vez em quando', 'Uso toda semana', 'Uso diariamente no trabalho', 'Já uso IA em processos estruturados'] },
  { name: 'ferramentas_utilizadas', label: 'Quais ferramentas de IA você utiliza?', placeholder: 'Ex.: ChatGPT, Gemini, Copilot, Canva IA ou nenhuma' },
  { name: 'site', label: 'Você tem site ou usa apenas redes sociais?', options: ['Tenho site ativo', 'Tenho site, mas está desatualizado', 'Uso apenas redes sociais', 'Não tenho site', 'Não se aplica'] },
  { name: 'objetivo', label: 'O que você gostaria de melhorar com IA?', type: 'textarea', required: true, placeholder: 'Conte em poucas palavras o que quer simplificar ou melhorar no trabalho...' },
  { name: 'investimento_mensal', label: 'Quanto investe por mês em tecnologia e melhorias?', options: ['R$ 0 — ainda não invisto', 'Até R$ 100', 'R$ 101 a R$ 300', 'R$ 301 a R$ 700', 'R$ 701 a R$ 1.500', 'Mais de R$ 1.500', 'Varia conforme a necessidade', 'Prefiro não informar'] }
];

const statusOptions = [
  { value: 'nova', label: 'Nova inscrição' },
  { value: 'contato_realizado', label: 'Contato realizado' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'convite_enviado', label: 'Convite enviado' },
  { value: 'desistiu', label: 'Desistiu' }
];
const statusLabel = value => statusOptions.find(item => item.value === value)?.label || value || 'Nova inscrição';

function Field({ q, value, onChange }) {
  return <label className="field">
    <span>{q.label}{q.required && <b className="req"> *</b>}</span>
    {q.options ? <select required={q.required} value={value || ''} onChange={e => onChange(q.name, e.target.value)}>
      <option value="">Selecione uma opção</option>{q.options.map(option => <option key={option} value={option}>{option}</option>)}
    </select> : q.type === 'textarea' ?
      <textarea rows="4" required={q.required} value={value || ''} placeholder={q.placeholder || ''} onChange={e => onChange(q.name, e.target.value)} /> :
      <input type={q.type || 'text'} required={q.required} value={value || ''} placeholder={q.placeholder || ''} onChange={e => onChange(q.name, e.target.value)} />}
  </label>;
}

export default function App() {
  const [page, setPage] = useState(location.hash === '#admin' ? 'admin' : 'home');
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState('warning');
  const [session, setSession] = useState(null);
  const [adminRows, setAdminRows] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [adminLoading, setAdminLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('suporteapp9@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMode, setResetMode] = useState(new URLSearchParams(location.search).get('reset-password') === 'true');
  const [resetBusy, setResetBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') { setResetMode(true); setPage('admin'); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (page === 'admin' && session) loadAdmin();
  }, [page, session]);

  function update(name, value) { setForm(current => ({ ...current, [name]: value })); }
  function showNotice(message, type = 'warning') { setNotice(message); setNoticeType(type); }

  async function submit(event) {
    event.preventDefault();
    setNotice('');
    setRegistrationSuccess(false);
    if (!supabase) { showNotice('A conexão com o banco não está configurada. Confira VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.'); return; }
    if (!form.consentimento) { showNotice('Marque o consentimento para enviar sua inscrição.'); return; }
    setBusy(true);
    const payload = { ...form, status: 'nova', convite_enviado: false };
    const { error } = await supabase.from(TABLE).insert(payload);
    setBusy(false);
    if (error) {
      console.error('Falha ao salvar inscrição:', error);
      showNotice('Não foi possível salvar sua inscrição. Tente novamente em instantes. Se o problema continuar, avise a equipe.');
      return;
    }
    setForm(emptyForm);
    setRegistrationSuccess(true);
    showNotice('Inscrição recebida! Entre no grupo de WhatsApp para acompanhar os avisos e orientações.', 'success');
  }

  async function login(event) {
    event.preventDefault();
    setNotice('');
    if (!supabase) { showNotice('A conexão com o Supabase não está configurada.'); return; }
    const email = loginEmail.trim().toLowerCase();
    if (email !== adminEmail) { showNotice('Este e-mail não tem autorização para acessar o painel.'); return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password: loginPassword });
    if (error) showNotice('Não foi possível entrar. Confira a senha e confirme que o usuário existe no Supabase Auth.');
    else { setNotice(''); setPage('admin'); location.hash = '#admin'; }
  }

  async function requestPasswordReset() {
    setNotice('');
    if (!supabase) { showNotice('A conexão com o Supabase não está configurada.'); return; }
    const email = loginEmail.trim().toLowerCase();
    if (email !== adminEmail) { showNotice('Informe o e-mail administrativo autorizado para redefinir a senha.'); return; }
    setResetBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/?reset-password=true#admin`
    });
    setResetBusy(false);
    if (error) {
      console.error('Falha ao solicitar redefinição de senha:', error);
      showNotice(`Falha no envio: ${error.message || 'erro não identificado'} (código: ${error.status || 'sem status'}). Confira Authentication > Emails e os limites de envio do Supabase.`);
    } else {
      showNotice('Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha. Confira sua caixa de entrada e o spam.', 'success');
    }
  }

  async function saveNewPassword(event) {
    event.preventDefault();
    setNotice('');
    if (!supabase) { showNotice('A conexão com o Supabase não está configurada.'); return; }
    if (newPassword.length < 8) { showNotice('A nova senha deve ter pelo menos 8 caracteres.'); return; }
    setResetBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setResetBusy(false);
    if (error) {
      console.error('Falha ao atualizar senha:', error);
      showNotice('Não foi possível alterar a senha. Solicite um novo link de redefinição e tente novamente.');
    } else {
      setResetMode(false);
      setSession(null);
      setNewPassword('');
      setLoginPassword('');
      setNotice('Senha redefinida com sucesso. Agora entre no CRM com a nova senha.', 'success');
      history.replaceState(null, '', '/#admin');
    }
  }

  async function loadAdmin() {
    if (!supabase) return;
    setAdminLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email?.toLowerCase() !== adminEmail) {
      setAdminRows([]);
      setAdminLoading(false);
      showNotice('Este usuário não está autorizado para o painel.');
      await supabase.auth.signOut();
      return;
    }
    const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Falha ao carregar inscrições:', error);
      showNotice('Não foi possível carregar as inscrições. Confira as políticas RLS da tabela no Supabase.');
      setAdminRows([]);
    } else {
      setAdminRows(data || []);
      setNotice('');
    }
    setAdminLoading(false);
  }

  async function changeStatus(id, status) {
    const { error } = await supabase.from(TABLE).update({ status, convite_enviado: status === 'convite_enviado' }).eq('id', id);
    if (error) { showNotice('Não foi possível atualizar o status. Confira as permissões de atualização no Supabase.'); return; }
    setAdminRows(rows => rows.map(row => row.id === id ? { ...row, status, convite_enviado: status === 'convite_enviado' } : row));
  }

  async function logout() {
    await supabase?.auth.signOut();
    setPage('home'); location.hash = ''; setAdminRows([]); setNotice('');
  }

  function exportCsv() {
    const headers = ['Nome', 'E-mail', 'WhatsApp', 'Perfil', 'Experiência com IA', 'Ferramentas', 'Site', 'Objetivo', 'Investimento mensal', 'Status', 'Convite enviado', 'Data'];
    const rows = filtered.map(row => [row.nome, row.email, row.whatsapp, row.perfil, row.experiencia_ia, row.ferramentas_utilizadas, row.site, row.objetivo, row.investimento_mensal, statusLabel(row.status), row.convite_enviado ? 'Sim' : 'Não', row.created_at]);
    const csv = [headers, ...rows].map(row => row.map(value => '"' + String(value ?? '').replaceAll('"', '""') + '"').join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'inscricoes-sala-secreta-ide.csv'; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const filtered = useMemo(() => adminRows.filter(row => {
    const searchable = [row.nome, row.whatsapp, row.email, row.perfil].join(' ').toLowerCase();
    return searchable.includes(search.toLowerCase()) && (statusFilter === 'todos' || row.status === statusFilter);
  }), [adminRows, search, statusFilter]);

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" onClick={event => { event.preventDefault(); setPage('home'); location.hash = ''; }} aria-label="Sala Secreta I.D.E.ia">
        <img className="brand-logo" src="/cardume-logo.jpg" alt="Cardume" />
        <span className="brand-divider" aria-hidden="true" />
        <span className="brand-sub">SALA SECRETA <strong>I.D.E.ia</strong></span>
      </a>
      <button className="admin-link" onClick={() => { setNotice(''); setPage('admin'); location.hash = '#admin'; }}><LockKeyhole size={15} /> Área da tutora</button>
    </header>

    {page === 'home' ? <main>
      <section className="hero">
        <div className="glow glow-one" /><div className="glow glow-two" />
        <div className="eyebrow"><Sparkles size={15} /> UMA NOVA FORMA DE TRABALHAR COM IA</div>
        <h1>Você não precisa de <em>mais ferramentas.</em><br className="desktop-break" /> Precisa fazer melhor com o que já tem.</h1>
        <p className="hero-copy">Identifica. Direciona. Expande. Três encontros práticos para organizar ideias, simplificar processos e transformar IA em resultado no trabalho.</p>
        <div className="pillars"><span><i>01</i> Identifica</span><span><i>02</i> Direciona</span><span><i>03</i> Expande</span></div>
        <div className="event-meta"><span>16, 17 e 18 de novembro</span><span>19h · Online e ao vivo</span></div>
        <div className="scarcity"><span className="live-dot" /> Apenas <strong>{CAPACITY} vagas</strong> para esta edição.</div>
      </section>

      <section className="form-wrap" id="inscricao">
        <div className="form-heading"><div><span className="section-kicker">VAGAS LIMITADAS</span><h2>Quero participar</h2><p>Preencha o formulário. Sua inscrição será conferida antes do envio das orientações de acesso.</p></div><div className="lock-art"><LockKeyhole size={24} /></div></div>
        {!supabase && <div className="notice warning">O formulário está temporariamente indisponível porque a conexão com o banco não foi configurada.</div>}
        {notice && page === 'home' && <div className={`notice ${noticeType}`} role="status">{notice}</div>}
        {registrationSuccess && <a className="primary-btn whatsapp-group-link" href="https://chat.whatsapp.com/ECEFpDiYL3GF5B84AxuIaS?s=cl&p=i&mlu=4&ilr=4&iam=2" target="_blank" rel="noreferrer"><MessageCircle size={18} /> Entrar no grupo de WhatsApp <ArrowRight size={17} /></a>}
        <form onSubmit={submit}>
          <div className="form-grid">{questions.map(question => <Field key={question.name} q={question} value={form[question.name]} onChange={update} />)}</div>
          <label className="consent"><input type="checkbox" checked={form.consentimento} onChange={event => update('consentimento', event.target.checked)} /><span>Concordo com o uso dos dados informados para gerenciar minha inscrição e receber contato sobre a Sala Secreta I.D.E.ia. <small>Os dados não serão exibidos publicamente.</small></span></label>
          <button className="primary-btn" type="submit" disabled={busy || !supabase}>{busy ? 'Enviando inscrição...' : 'Enviar minha inscrição'} <ArrowRight size={17} /></button>
          <p className="privacy-note">Sua inscrição não adiciona você automaticamente a um grupo. A equipe enviará as orientações após a conferência.</p>
        </form>
      </section>

      <section className="bottom-note"><img className="bottom-brand-logo" src="/cardume-logo.jpg" alt="Cardume" /><p>Identifica <b>·</b> Direciona <b>·</b> Expande</p><small>Sala Secreta I.D.E.ia · Organizar para multiplicar.</small></section>
    </main> : <main className="admin-page">
      {(!session || resetMode) ? <section className="login-card">
        <div className="lock-art"><LockKeyhole size={26} /></div><span className="section-kicker">ACESSO RESTRITO</span><h1>{resetMode ? 'Criar nova senha' : 'Painel da tutora'}</h1><p>{resetMode ? 'Defina uma nova senha para acessar o CRM.' : 'Entre para consultar inscrições e acompanhar os convites.'}</p>
        {notice && <div className={`notice ${noticeType}`}>{notice}</div>}
        {resetMode ? <form onSubmit={saveNewPassword}>
          <label className="field"><span>Nova senha (mínimo 8 caracteres)</span><input type="password" minLength={8} required autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} /></label>
          <button className="primary-btn" type="submit" disabled={resetBusy}>{resetBusy ? 'Salvando...' : 'Salvar nova senha'} <ArrowRight size={17} /></button>
        </form> : <form onSubmit={login}>
          <label className="field"><span>E-mail administrativo</span><input type="email" required value={loginEmail} onChange={event => setLoginEmail(event.target.value)} /></label>
          <label className="field"><span>Senha</span><input type="password" required autoComplete="current-password" value={loginPassword} onChange={event => setLoginPassword(event.target.value)} /></label>
          <button className="primary-btn" type="submit">Entrar no CRM <ArrowRight size={17} /></button>
          <button className="ghost-btn reset-password-btn" type="button" onClick={requestPasswordReset} disabled={resetBusy}>{resetBusy ? 'Enviando...' : 'Esqueci minha senha · Redefinir senha'}</button>
        </form>}
      </section> : <section className="crm">
        <div className="crm-head"><div><span className="section-kicker">SALA SECRETA I.D.E.ia</span><h1>CRM de inscrições</h1><p>Conferência manual antes de enviar as orientações de acesso.</p></div><button className="ghost-btn" onClick={logout}><LogOut size={16} /> Sair</button></div>
        <div className="stats">
          <div><Users /><span>Total de inscrições</span><strong>{adminRows.length}</strong></div>
          <div><CheckCircle2 /><span>Confirmadas</span><strong>{adminRows.filter(row => row.status === 'confirmada').length}</strong></div>
          <div><MessageCircle /><span>Convite enviado</span><strong>{adminRows.filter(row => row.convite_enviado).length}</strong></div>
          <div><LockKeyhole /><span>Vagas restantes</span><strong>{Math.max(0, CAPACITY - adminRows.filter(row => row.status !== 'desistiu').length)}</strong></div>
        </div>
        {notice && <div className={`notice ${noticeType}`}>{notice}</div>}
        <div className="table-tools">
          <label className="search-box"><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar nome, WhatsApp ou e-mail" /></label>
          <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option value="todos">Todos os status</option>{statusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          <button className="ghost-btn" onClick={exportCsv}><Download size={16} /> Exportar CSV</button>
          <button className="ghost-btn" onClick={loadAdmin}><RefreshCw size={16} /> Atualizar</button>
        </div>
        {adminLoading ? <p>Carregando inscrições...</p> : filtered.length === 0 ? <div className="empty-state"><Users size={30} /><p>Nenhuma inscrição encontrada com esses filtros.</p></div> : <div className="table-scroll"><table><thead><tr><th>Participante</th><th>Contato</th><th>Perfil e IA</th><th>Objetivo</th><th>Status</th><th>Ações</th></tr></thead><tbody>{filtered.map(row => <tr key={row.id}>
          <td><strong>{row.nome}</strong><small>{new Date(row.created_at).toLocaleString('pt-BR')}</small></td>
          <td><a href={`https://wa.me/55${String(row.whatsapp || '').replace(/\D/g, '').replace(/^55/, '')}`} target="_blank" rel="noreferrer">{row.whatsapp}</a><small>{row.email}</small></td>
          <td><span>{row.perfil || '—'}</span><small>{row.experiencia_ia || '—'}</small><small>{row.ferramentas_utilizadas || ''}</small></td>
          <td><small>{row.objetivo || '—'}</small><small>Site: {row.site || '—'}</small><small>Investimento: {row.investimento_mensal || '—'}</small></td>
          <td><select className="status-select" value={row.status || 'nova'} onChange={event => changeStatus(row.id, event.target.value)}>{statusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></td>
          <td><button className="mini-btn" onClick={() => window.open(`https://wa.me/55${String(row.whatsapp || '').replace(/\D/g, '').replace(/^55/, '')}`, '_blank', 'noopener')}>WhatsApp</button><button className="mini-btn secondary" onClick={() => alert(`Objetivo: ${row.objetivo || '—'}\nFerramentas: ${row.ferramentas_utilizadas || '—'}\nInvestimento: ${row.investimento_mensal || '—'}`)}>Ver respostas</button></td>
        </tr>)}</tbody></table></div>}
        <p className="admin-hint">Fluxo: Nova inscrição → Contato realizado → Confirmada → Convite enviado.</p>
      </section>}
    </main>}
    <footer>© Sala Secreta I.D.E.ia <span>•</span> Identifica · Direciona · Expande</footer>
  </div>;
}
