import React, { useEffect, useMemo, useState } from 'react';
import ParticipantArea from './ParticipantArea.jsx';
import { createClient } from '@supabase/supabase-js';
import { LockKeyhole, Sparkles, Users, Search, LogOut, Download, CheckCircle2, ArrowRight, MessageCircle, RefreshCw, FileText, FileSpreadsheet, Trash2, X, Lightbulb, ClipboardCopy, Printer, Network, Workflow } from 'lucide-react';

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
  { value: 'lista_espera_dezembro', label: 'Lista de espera — dezembro' },
  { value: 'nova', label: 'Nova inscrição' },
  { value: 'contato_realizado', label: 'Contato realizado' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'convite_enviado', label: 'Convite enviado' },
  { value: 'desistiu', label: 'Desistiu' }
];
const statusLabel = value => statusOptions.find(item => item.value === value)?.label || value || 'Nova inscrição';

const exportColumns = [
  ['Nome', 'nome'], ['E-mail', 'email'], ['WhatsApp', 'whatsapp'],
  ['Perfil profissional', 'perfil'], ['Experiência com IA', 'experiencia_ia'],
  ['Ferramentas utilizadas', 'ferramentas_utilizadas'], ['Site / presença digital', 'site'],
  ['Objetivo / necessidade', 'objetivo'], ['Investimento mensal', 'investimento_mensal'],
  ['Status', 'status'], ['Convite enviado', 'convite_enviado'], ['Data de inscrição', 'created_at']
];

function buildTrainingMap(rows) {
  const textOf = row => [row.objetivo, row.experiencia_ia, row.ferramentas_utilizadas, row.site, row.perfil].filter(Boolean).join(' ').toLocaleLowerCase('pt-BR');
  const groups = [
    { key:'produtividade', title:'Organização e produtividade', re:/tempo|rotina|agenda|prioridade|organiza|repetitiv|produt|tarefa|agilidade/i, tool:'ChatGPT ou Claude', action:'Mapear uma rotina, dividir em etapas e criar um assistente de priorização.', prompt:'Atue como consultor de produtividade. Faça perguntas para mapear minha rotina, identifique tarefas repetitivas e proponha um fluxo mais simples com IA. Entregue etapas, prompt reutilizável e indicador de tempo economizado.' },
    { key:'conteudo', title:'Conteúdo e presença digital', re:/conte[uú]do|rede social|instagram|post|marketing|arte|copy|marca|site/i, tool:'ChatGPT ou Claude + Canva/Gemini', action:'Criar calendário editorial, modelos de conteúdo e fluxo de aprovação.', prompt:'Atue como estrategista de conteúdo. Com base no meu público, objetivo e canais, crie um calendário de 30 dias, modelos de legenda, briefing de arte e um processo simples de revisão e publicação.' },
    { key:'atendimento', title:'Atendimento, relacionamento e vendas', re:/atendimento|cliente|venda|lead|whatsapp|prospec|comercial|mensagem|aus[eê]ncia/i, tool:'ChatGPT ou Claude; Lovable para prototipar CRM', action:'Padronizar triagem, respostas, follow-up e acompanhamento de oportunidades.', prompt:'Atue como especialista em atendimento e vendas. Desenhe um fluxo de triagem, respostas-padrão, follow-up e registro de oportunidades. Inclua mensagens para WhatsApp, critérios de prioridade e indicadores de conversão.' },
    { key:'processos', title:'Processos e automação', re:/processo|automat|planilha|relat[oó]rio|sistema|crm|fluxo|financeiro|integra/i, tool:'Claude ou ChatGPT para especificar; Lovable para construir', action:'Escolher um processo, desenhar o fluxo e construir um pequeno app ou painel.', prompt:'Atue como analista de processos e product owner. Documente o processo atual, identifique gargalos, desenhe o fluxo futuro e escreva uma especificação para um app interno no Lovable, incluindo telas, campos, regras e critérios de aceite.' },
    { key:'dados', title:'Análise de dados e decisões', re:/an[aá]lise|dados|indicador|relat[oó]rio|decis|m[eé]trica|planilha/i, tool:'ChatGPT ou Claude + planilha; Lovable para painel', action:'Definir indicadores, organizar uma base e criar rotina de leitura dos resultados.', prompt:'Atue como analista de negócios. Ajude a definir os indicadores mais úteis, a estrutura de uma planilha e uma rotina semanal de análise. Explique como transformar os dados em decisões e ações.' }
  ];
  const needs=groups.map(group=>{const matches=rows.filter(row=>group.re.test(textOf(row)));return {...group,count:matches.length,examples:[...new Set(matches.map(row=>row.objetivo).filter(Boolean))].slice(0,3)};}).filter(group=>group.count>0).sort((a,b)=>b.count-a.count);
  const countBy=field=>{const counts=new Map();rows.forEach(row=>{const value=String(row[field]||'Não informado').trim()||'Não informado';counts.set(value,(counts.get(value)||0)+1);});return [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);};
  const lowExperience=rows.filter(row=>/ainda não uso|raramente/i.test(row.experiencia_ia||'')).length;
  return {
    total:rows.length,profiles:countBy('perfil'),experience:countBy('experiencia_ia'),tools:countBy('ferramentas_utilizadas'),lowExperience,needs,
    actions:[
      {stage:'IDENTIFICA',title:'Diagnosticar necessidades reais',detail:'Agrupar objetivos, tarefas, experiência com IA e ferramentas já utilizadas. Priorizar os temas com maior recorrência.',tool:'ChatGPT ou Claude',prompt:'Atue como facilitador do método I.D.E.ia. Analise as necessidades do grupo, organize por frequência e impacto, separe sintomas de causas e proponha perguntas de aprofundamento para a aula de Identifica.'},
      {stage:'DIRECIONA',title:'Transformar necessidade em solução',detail:'Para cada tema prioritário, escolher uma ferramenta, desenhar o passo a passo e praticar com um caso real.',tool:'ChatGPT / Claude / Lovable',prompt:'Atue como consultor de IA aplicada. Para cada necessidade priorizada, recomende se a solução deve ser feita por conversa com ChatGPT/Claude, por automação simples ou por um pequeno aplicativo no Lovable. Entregue passo a passo, prompt inicial, dados necessários e cuidados.'},
      {stage:'EXPANDE',title:'Aplicar, medir e ampliar',detail:'Executar um piloto, medir tempo, qualidade ou conversão e documentar o que pode ser replicado.',tool:'Lovable + planilha de indicadores',prompt:'Crie um plano de expansão de 30 dias para as soluções escolhidas. Defina responsável, rotina de uso, indicador antes/depois, meta, revisão semanal e critério para replicar a solução.'}
    ]
  };
}


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
  const [adminMaps, setAdminMaps] = useState([]);
  const [trainingTasks, setTrainingTasks] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [deleteBusyId, setDeleteBusyId] = useState(null);
  const [printReport, setPrintReport] = useState(null);
  const [copyNotice, setCopyNotice] = useState('');
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

  useEffect(() => {
    if (!printReport) return;
    const handleAfterPrint = () => setPrintReport(null);
    window.addEventListener('afterprint', handleAfterPrint);
    const timer = window.setTimeout(() => window.print(), 250);
    return () => { window.clearTimeout(timer); window.removeEventListener('afterprint', handleAfterPrint); };
  }, [printReport]);

  function update(name, value) { setForm(current => ({ ...current, [name]: value })); }
  function showNotice(message, type = 'warning') { setNotice(message); setNoticeType(type); }

  async function submit(event) {
    event.preventDefault();
    setNotice('');
    setRegistrationSuccess(false);
    if (!supabase) { showNotice('A conexão com o banco não está configurada. Confira VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.'); return; }
    if (!form.consentimento) { showNotice('Marque o consentimento para enviar sua inscrição.'); return; }
    setBusy(true);
    const payload = { ...form, status: 'lista_espera_dezembro', convite_enviado: false };
    const { error } = await supabase.from(TABLE).insert(payload);
    setBusy(false);
    if (error) {
      console.error('Falha ao salvar inscrição:', error);
      showNotice('Não foi possível salvar sua inscrição. Tente novamente em instantes. Se o problema continuar, avise a equipe.');
      return;
    }
    setForm(emptyForm);
    setRegistrationSuccess(true);
    showNotice('Cadastro recebido! Você está na lista de espera de dezembro. A equipe entrará em contato com as próximas informações.', 'success');
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
    const { data: mapsData, error: mapsError } = await supabase.from('ideia_mindmaps').select('*').order('updated_at', { ascending: false });
    if (mapsError) { console.warn('Não foi possível carregar mapas I.D.E.ia:', mapsError); setAdminMaps([]); }
    else setAdminMaps(mapsData || []);
    const initialNeeds = buildTrainingMap(data || []).needs;
    if (initialNeeds.length) {
      const seedRows = initialNeeds.map(need => ({ need_key:need.key, title:need.title, summary:`${need.count} inscrição(ões) relacionadas`, action:need.action, tool:need.tool, prompt:need.prompt }));
      const { error: seedError } = await supabase.from('ideia_training_tasks').upsert(seedRows, { onConflict:'need_key', ignoreDuplicates:true });
      if (seedError) console.warn('Não foi possível iniciar o quadro de necessidades:', seedError);
    }
    const { data: tasksData, error: tasksError } = await supabase.from('ideia_training_tasks').select('*').order('created_at', { ascending:true });
    if (tasksError) { console.warn('Quadro de necessidades indisponível:', tasksError); setTrainingTasks([]); }
    else setTrainingTasks(tasksData || []);
    setAdminLoading(false);
  }

  async function changeStatus(id, status) {
    const { error } = await supabase.from(TABLE).update({ status, convite_enviado: status === 'convite_enviado' }).eq('id', id);
    if (error) { showNotice('Não foi possível atualizar o status. Confira as permissões de atualização no Supabase.'); return; }
    setAdminRows(rows => rows.map(row => row.id === id ? { ...row, status, convite_enviado: status === 'convite_enviado' } : row));
  }

  async function deleteRegistration(row) {
    if (!row?.id || !supabase) return;
    const confirmed = window.confirm(`Excluir definitivamente o cadastro de ${row.nome || 'este participante'} (${row.email || 'sem e-mail'})? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;
    setDeleteBusyId(row.id);
    showNotice('');
    const { data, error } = await supabase.from(TABLE).delete().eq('id', row.id).select('id').maybeSingle();
    setDeleteBusyId(null);
    if (error) {
      console.error('Falha ao excluir inscrição:', error);
      showNotice(`Não foi possível excluir o cadastro: ${error.message}. Verifique a política DELETE administrativa no Supabase.`);
      return;
    }
    if (!data) {
      showNotice('Nenhum cadastro foi excluído. A política de segurança pode estar bloqueando a operação.');
      return;
    }
    setAdminRows(current => current.filter(item => item.id !== row.id));
    setSelectedRow(null);
    showNotice('Cadastro excluído com sucesso.', 'success');
  }

  function exportExcel(rows, filename) {
    const csvRows = [
      exportColumns.map(column => column[0]),
      ...rows.map(row => exportColumns.map(([label, key]) => {
        if (key === 'status') return statusLabel(row.status);
        if (key === 'convite_enviado') return row.convite_enviado ? 'Sim' : 'Não';
        if (key === 'created_at') return row.created_at ? new Date(row.created_at).toLocaleString('pt-BR') : '';
        return row[key] ?? '';
      }))
    ];
    const csv = csvRows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function updateTaskStatus(task, status) {
    const { data, error } = await supabase.from('ideia_training_tasks')
      .update({ task_status: status, updated_at: new Date().toISOString() })
      .eq('id', task.id).select('*').single();
    if (error) {
      console.error('Falha ao mover cartão do Kanban:', error);
      showNotice(`Não foi possível atualizar o Kanban: ${error.message}. Verifique se a migração do quadro foi executada no Supabase.`);
      return;
    }
    setTrainingTasks(current => current.map(item => item.id === task.id ? data : item));
  }

  async function copyPrompt(prompt) {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyNotice('Prompt copiado. Cole no ChatGPT ou Claude.');
      window.setTimeout(() => setCopyNotice(''), 3500);
    } catch {
      setCopyNotice('Não foi possível copiar automaticamente. Copie o texto do cartão manualmente.');
    }
  }

  async function logout() {
    await supabase?.auth.signOut();
    setPage('home'); location.hash = ''; setAdminRows([]); setNotice('');
  }

  const filtered = useMemo(() => adminRows.filter(row => {
    const searchable = [row.nome, row.whatsapp, row.email, row.perfil, row.objetivo, row.ferramentas_utilizadas].join(' ').toLowerCase();
    return searchable.includes(search.toLowerCase()) && (statusFilter === 'todos' || row.status === statusFilter);
  }), [adminRows, search, statusFilter]);
  const trainingMap = useMemo(() => buildTrainingMap(filtered), [filtered]);

  if (location.pathname.replace(/\/$/, '') === '/participante') {
    return <ParticipantArea />;
  }

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
        <div className="eyebrow"><Sparkles size={15} /> PRÓXIMA EDIÇÃO · DEZEMBRO</div>
        <h1>As vagas desta edição estão <em>encerradas.</em><br className="desktop-break" /> Entre na lista de espera para dezembro.</h1>
        <p className="hero-copy">A próxima Sala Secreta I.D.E.ia acontece em dezembro. Cadastre-se para receber as informações e ser avisado quando as inscrições abrirem.</p>
        <div className="pillars"><span><i>01</i> Identifica</span><span><i>02</i> Direciona</span><span><i>03</i> Expande</span></div>
        <div className="event-meta"><span>Próxima edição: dezembro</span><span>Online e ao vivo</span></div>
        <div className="scarcity"><span className="live-dot" /> <strong>Vagas encerradas</strong> para novembro.</div>
      </section>

      <section className="form-wrap" id="inscricao">
        <div className="form-heading"><div><span className="section-kicker">LISTA DE ESPERA · DEZEMBRO</span><h2>Quero entrar na lista de espera</h2><p>Preencha seus dados para receber o aviso da próxima edição assim que as inscrições forem abertas.</p></div><div className="lock-art"><LockKeyhole size={24} /></div></div>
        {!supabase && <div className="notice warning">O formulário está temporariamente indisponível porque a conexão com o banco não foi configurada.</div>}
        {notice && page === 'home' && <div className={`notice ${noticeType}`} role="status">{notice}</div>}
        {registrationSuccess ? <div className="registration-confirmation" role="status">
          <div className="confirmation-icon"><CheckCircle2 size={34} /></div>
          <span className="section-kicker">LISTA DE ESPERA CONFIRMADA</span>
          <h2>Seu interesse foi registrado!</h2>
          <p>Você está na lista de espera para a edição de dezembro da Sala Secreta I.D.E.ia. Nossa equipe entrará em contato quando as inscrições forem abertas.</p>
          <p className="privacy-note">Fique de olho no seu WhatsApp e e-mail para receber as novidades.</p>
        </div> : <form onSubmit={submit}>
          <div className="form-grid">{questions.map(question => <Field key={question.name} q={question} value={form[question.name]} onChange={update} />)}</div>
          <label className="consent"><input type="checkbox" checked={form.consentimento} onChange={event => update('consentimento', event.target.checked)} /><span>Concordo com o uso dos dados informados para gerenciar minha inscrição e receber contato sobre a Sala Secreta I.D.E.ia. <small>Os dados não serão exibidos publicamente.</small></span></label>
          <button className="primary-btn" type="submit" disabled={busy || !supabase}>{busy ? 'Enviando...' : 'Entrar na lista de espera'} <ArrowRight size={17} /></button>
          <p className="privacy-note">Ao enviar, você autoriza o contato sobre a próxima edição em dezembro.</p>
        </form>}
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
          <label className="search-box"><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar nome, WhatsApp, e-mail ou necessidade" /></label>
          <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option value="todos">Todos os status</option>{statusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          <button className="ghost-btn" onClick={() => exportExcel(filtered, 'sala-secreta-grupo.csv')}><FileSpreadsheet size={16} /> Excel do grupo (.csv)</button>
          <button className="ghost-btn" onClick={() => requestPrint({ type: 'group', rows: filtered })}><FileText size={16} /> PDF do grupo</button>
          <button className="ghost-btn" onClick={() => requestPrint({ type: 'training', rows: filtered, map: trainingMap })}><Lightbulb size={16} /> Mapa I.D.E.ia</button>
          <button className="ghost-btn" onClick={loadAdmin}><RefreshCw size={16} /> Atualizar</button>
        </div>
        {copyNotice && <div className="notice success">{copyNotice}</div>}
        {adminLoading ? <p>Carregando inscrições...</p> : filtered.length === 0 ? <div className="empty-state"><Users size={30} /><p>Nenhuma inscrição encontrada com esses filtros.</p></div> : <div className="table-scroll"><table><thead><tr><th>Participante</th><th>Contato</th><th>Perfil e IA</th><th>Objetivo</th><th>Status</th><th>Ações</th></tr></thead><tbody>{filtered.map(row => <tr key={row.id}>
          <td><strong>{row.nome}</strong><small>{new Date(row.created_at).toLocaleString('pt-BR')}</small></td>
          <td><a href={`https://wa.me/55${String(row.whatsapp || '').replace(/\D/g, '').replace(/^55/, '')}`} target="_blank" rel="noreferrer">{row.whatsapp}</a><small>{row.email}</small></td>
          <td><span>{row.perfil || '—'}</span><small>{row.experiencia_ia || '—'}</small><small>{row.ferramentas_utilizadas || ''}</small></td>
          <td><small>{row.objetivo || '—'}</small><small>Site: {row.site || '—'}</small><small>Investimento: {row.investimento_mensal || '—'}</small></td>
          <td><select className="status-select" value={row.status || 'nova'} onChange={event => changeStatus(row.id, event.target.value)}>{statusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></td>
          <td className="admin-row-actions">
            <button className="mini-btn secondary" onClick={() => setSelectedRow(row)}>Ver respostas</button>
            <button className="mini-btn secondary" onClick={() => exportExcel([row], `respostas-${String(row.nome || 'participante').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`)}><FileSpreadsheet size={13}/> Excel</button>
            <button className="mini-btn secondary" onClick={() => requestPrint({ type: 'individual', rows: [row] })}><FileText size={13}/> PDF</button>
            <button className="mini-btn danger" disabled={deleteBusyId === row.id} onClick={() => deleteRegistration(row)}><Trash2 size={13}/> {deleteBusyId === row.id ? 'Excluindo...' : 'Excluir'}</button>
          </td>
        </tr>)}</tbody></table></div>}

        <section className="training-map-section">
          <div className="crm-head"><div><span className="section-kicker">MAPA DE IDEIAS · A PARTIR DAS RESPOSTAS</span><h2>Mapa mental para o treinamento I.D.E.ia</h2><p>Visão do grupo com base nas {trainingMap.total} inscrições do filtro atual.</p></div></div>
          <div className="training-map-stats">
            <div><strong>{trainingMap.total}</strong><span>respostas analisadas</span></div>
            <div><strong>{trainingMap.lowExperience}</strong><span>ainda não usam IA ou usam raramente</span></div>
            <div><strong>{trainingMap.needs.length}</strong><span>frentes de necessidade encontradas</span></div>
          </div>
          <div className="idea-map-canvas">
            <svg className="idea-map-lines" viewBox="0 0 1000 460" preserveAspectRatio="none" aria-hidden="true">
              <path d="M500 76 C500 138 170 120 170 220" />
              <path d="M500 76 L500 220" />
              <path d="M500 76 C500 138 830 120 830 220" />
            </svg>
            <div className="idea-map-root"><Network size={20}/><span>NECESSIDADES DO GRUPO</span><strong>{trainingMap.total} participantes</strong></div>
            <div className="idea-map-branches">
              <article className="idea-map-branch identify">
                <span>01 · IDENTIFICA</span><h3>O que precisa melhorar?</h3>
                <p>As dores, tarefas e oportunidades que aparecem nas respostas.</p>
                {trainingMap.needs.map(need => <div className="idea-map-node" key={need.key}><strong>{need.title}</strong><b>{need.count} pessoa(s)</b><small>{need.examples[0] || 'Necessidade indicada no formulário.'}</small></div>)}
              </article>
              <article className="idea-map-branch direct">
                <span>02 · DIRECIONA</span><h3>Qual solução ensinar?</h3>
                <p>Transformar cada necessidade em uma prática concreta.</p>
                {trainingMap.needs.map(need => <div className="idea-map-node" key={need.key}><strong>{need.action}</strong><small>Ferramenta: {need.tool}</small></div>)}
              </article>
              <article className="idea-map-branch expand">
                <span>03 · EXPANDE</span><h3>Como colocar em prática?</h3>
                <p>Testar, medir resultados e ampliar o que funcionar.</p>
                {trainingMap.actions.map(action => <div className="idea-map-node" key={action.stage}><strong>{action.title}</strong><small>{action.detail}</small></div>)}
              </article>
            </div>
          </div>

          <div className="training-kanban-head"><div><span className="section-kicker">QUADRO DE EXECUÇÃO</span><h3>Kanban das necessidades do diagnóstico</h3><p>Mova cada necessidade conforme o conteúdo for preparado e aplicado no treinamento.</p></div><Workflow size={28}/></div>
          <div className="training-kanban">
            {[
              { key: 'para_fazer', title: 'Para fazer', className: 'todo' },
              { key: 'em_andamento', title: 'Em andamento', className: 'doing' },
              { key: 'feito', title: 'Feito', className: 'done' }
            ].map(column => <section className={`kanban-column ${column.className}`} key={column.key}>
              <header><strong>{column.title}</strong><b>{trainingTasks.filter(task => trainingMap.needs.some(need => need.key === task.need_key) && task.task_status === column.key).length}</b></header>
              {trainingMap.needs.filter(need => (trainingTasks.find(task => task.need_key === need.key)?.task_status || 'para_fazer') === column.key).map(need => {
                const task = trainingTasks.find(item => item.need_key === need.key);
                return <article className="kanban-card" key={need.key}>
                  <span className="kanban-count">{need.count} resposta(s)</span>
                  <h4>{need.title}</h4>
                  <p>{need.action}</p>
                  <small><b>Ferramenta:</b> {need.tool}</small>
                  <button className="prompt-btn" onClick={() => copyPrompt(need.prompt)}><ClipboardCopy size={14}/> Copiar prompt</button>
                  <label>Mover para<select value={column.key} onChange={event => task && updateTaskStatus(task, event.target.value)} disabled={!task}><option value="para_fazer">Para fazer</option><option value="em_andamento">Em andamento</option><option value="feito">Feito</option></select></label>
                </article>;
              })}
              {!trainingMap.needs.some(need => (trainingTasks.find(task => task.need_key === need.key)?.task_status || 'para_fazer') === column.key) && <p className="kanban-empty">Nenhuma necessidade nesta etapa.</p>}
            </section>)}
          </div>
          {!trainingTasks.length && <div className="notice warning">O Kanban precisa da migração de banco ideia_training_tasks. O quadro será ativado depois de aplicar a migração no Supabase.</div>}
          <div className="training-prompt-actions">
            {trainingMap.actions.map(action => <article key={action.stage}><span>{action.stage}</span><strong>{action.title}</strong><p>{action.detail}</p><small>Ferramentas: {action.tool}</small><button className="prompt-btn" onClick={() => copyPrompt(action.prompt)}><ClipboardCopy size={14}/> Copiar prompt para {action.stage.toLowerCase()}</button></article>)}
          </div>
        </section>
        <section className="admin-maps-section">
          <div className="crm-head"><div><span className="section-kicker">ACOMPANHAMENTO I.D.E.ia</span><h2>Mapas mentais dos participantes</h2><p>Visualização administrativa dos diagnósticos e planos individuais.</p></div></div>
          {adminMaps.length === 0 ? <div className="empty-state"><LockKeyhole size={28}/><p>Nenhum mapa mental criado ainda.</p></div> : <div className="admin-map-grid">{adminMaps.map(item => <article className="admin-map-card" key={item.id}><div><strong>{item.title || "Meu Plano I.D.E.ia"}</strong><small>{item.user_id}</small><small>Atualizado em {new Date(item.updated_at).toLocaleString("pt-BR")}</small></div><button className="mini-btn secondary" onClick={() => alert(JSON.stringify({respostas:item.answers, mapa:item.mindmap}, null, 2))}>Ver diagnóstico e mapa</button></article>)}</div>}
        </section>
        <p className="admin-hint">Fluxo: Nova inscrição → Contato realizado → Confirmada → Convite enviado.</p>
      </section>}
    </main>}
    {selectedRow && <div className="admin-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setSelectedRow(null); }}>
      <section className="admin-answer-modal" role="dialog" aria-modal="true" aria-label="Respostas individuais">
        <header><div><span className="section-kicker">RESPOSTAS INDIVIDUAIS</span><h2>{selectedRow.nome}</h2><p>{selectedRow.email} · {selectedRow.whatsapp}</p></div><button className="icon-close" onClick={() => setSelectedRow(null)} aria-label="Fechar"><X size={20}/></button></header>
        <div className="admin-answer-grid">
          {exportColumns.map(([label,key]) => <article key={key}><strong>{label}</strong><p>{key === 'status' ? statusLabel(selectedRow.status) : key === 'convite_enviado' ? (selectedRow.convite_enviado ? 'Sim' : 'Não') : key === 'created_at' && selectedRow.created_at ? new Date(selectedRow.created_at).toLocaleString('pt-BR') : (selectedRow[key] || '—')}</p></article>)}
        </div>
        <footer>
          <button className="ghost-btn" onClick={() => exportExcel([selectedRow], `respostas-${String(selectedRow.nome || 'participante').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`)}><FileSpreadsheet size={16}/> Excel individual</button>
          <button className="ghost-btn" onClick={() => requestPrint({ type: 'individual', rows: [selectedRow] })}><FileText size={16}/> PDF individual</button>
          <button className="mini-btn danger" disabled={deleteBusyId === selectedRow.id} onClick={() => deleteRegistration(selectedRow)}><Trash2 size={15}/> Excluir cadastro</button>
        </footer>
      </section>
    </div>}

    {printReport && <div className="print-report">
      <header className="print-report-head"><span>SALA SECRETA I.D.E.ia</span><h1>{printReport.type === 'training' ? 'Mapa mental do treinamento I.D.E.ia' : printReport.type === 'individual' ? 'Respostas da inscrição' : 'Relatório de inscrições'}</h1><p>Gerado em {new Date().toLocaleString('pt-BR')} · {printReport.rows?.length || 0} participante(s)</p></header>
      {printReport.type === 'training' ? <div className="print-training">
        <h2>IDENTIFICA · Necessidades observadas</h2>
        <p>Base analisada: {printReport.map.total} inscrição(ões). {printReport.map.lowExperience} pessoa(s) informaram que ainda não usam IA ou usam raramente.</p>
        <ul>{printReport.map.needs.map(need => <li key={need.key}><strong>{need.title} — {need.count} pessoa(s)</strong><br/>{need.examples.join(' · ')}</li>)}</ul>
        <h2>DIRECIONA · Ações e ferramentas</h2>
        {printReport.map.needs.map(need => <article key={need.key}><h3>{need.title}</h3><p>{need.action}</p><p><strong>Ferramentas:</strong> {need.tool}</p><p><strong>Prompt:</strong> {need.prompt}</p></article>)}
        <h2>EXPANDE · Plano de aplicação</h2>
        {printReport.map.actions.map(action => <article key={action.stage}><h3>{action.stage} · {action.title}</h3><p>{action.detail}</p><p><strong>Ferramentas:</strong> {action.tool}</p><p><strong>Prompt:</strong> {action.prompt}</p></article>)}
      </div> : printReport.type === 'individual' ? <div className="print-individual">
        {printReport.rows.map(row => <section key={row.id}><h2>{row.nome}</h2><p>{row.email} · {row.whatsapp}</p><table><tbody>{exportColumns.map(([label,key]) => <tr key={key}><th>{label}</th><td>{key === 'status' ? statusLabel(row.status) : key === 'convite_enviado' ? (row.convite_enviado ? 'Sim' : 'Não') : key === 'created_at' && row.created_at ? new Date(row.created_at).toLocaleString('pt-BR') : (row[key] || '—')}</td></tr>)}</tbody></table></section>)}
      </div> : <div className="print-group"><table><thead><tr>{exportColumns.map(([label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{printReport.rows.map(row => <tr key={row.id}>{exportColumns.map(([label,key]) => <td key={key}>{key === 'status' ? statusLabel(row.status) : key === 'convite_enviado' ? (row.convite_enviado ? 'Sim' : 'Não') : key === 'created_at' && row.created_at ? new Date(row.created_at).toLocaleString('pt-BR') : (row[key] || '—')}</td>)}</tr>)}</tbody></table></div>}
    </div>}

    <footer>© Sala Secreta I.D.E.ia <span>•</span> Identifica · Direciona · Expande</footer>
  </div>;
}
