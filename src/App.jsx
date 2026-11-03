import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LockKeyhole, Sparkles, Users, Search, LogOut, Download, CheckCircle2, ArrowRight, MessageCircle, XCircle } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase().trim();
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const emptyForm = {
  full_name:'', whatsapp:'', email:'', city:'', role:'', business_name:'',
  challenge:'', ai_usage:'', ai_level:'', ai_tools:'', software_usage:'',
  software_names:'', has_website:'', wants_system:'', improvement_investment:'',
  monthly_budget:'', consent:false
};

const questions = [
  {name:'full_name', label:'Nome completo', required:true, placeholder:'Seu nome e sobrenome'},
  {name:'whatsapp', label:'WhatsApp com DDD', required:true, placeholder:'(41) 99999-9999'},
  {name:'email', label:'E-mail', type:'email', required:true, placeholder:'voce@exemplo.com'},
  {name:'city', label:'Cidade e estado', placeholder:'Ex.: Curitiba, PR'},
  {name:'role', label:'Qual é sua função hoje?', options:['Empreendedor(a) / dono(a) de negócio','Profissional autônomo(a)','Gestor(a) / coordenador(a)','Profissional de equipe','Consultor(a) / prestador(a) de serviços','Estou começando um negócio','Outra']},
  {name:'business_name', label:'Nome da empresa (se tiver)', placeholder:'Nome do negócio ou “não se aplica”'},
  {name:'challenge', label:'Qual é seu maior desafio profissional hoje?', type:'textarea', placeholder:'Conte em poucas palavras...'},
  {name:'ai_usage', label:'Você já usa inteligência artificial?', options:['Não uso ainda','Já testei, mas uso raramente','Uso de vez em quando','Uso toda semana','Uso diariamente no trabalho','Já uso IA em processos estruturados']},
  {name:'ai_level', label:'Como avalia seu nível de conhecimento em IA?', options:['Iniciante: preciso aprender do zero','Básico: faço perguntas simples','Intermediário: uso para várias tarefas','Avançado: crio fluxos ou automações','Não sei avaliar']},
  {name:'ai_tools', label:'Quais ferramentas de IA você utiliza?', placeholder:'Ex.: ChatGPT, Gemini, Copilot, Canva IA ou nenhuma'},
  {name:'software_usage', label:'Você usa sistemas ou softwares no trabalho?', options:['Não uso nenhum sistema','Planilhas e ferramentas básicas','Sistema de gestão / ERP','CRM para clientes e vendas','Ferramentas de projetos e tarefas','Vários sistemas integrados','Outro']},
  {name:'software_names', label:'Quais sistemas ou softwares usa hoje?', type:'textarea', placeholder:'Ex.: Excel, CRM, sistema financeiro, agenda...'},
  {name:'has_website', label:'Você tem site?', options:['Sim, e gera contatos ou vendas','Sim, mas está desatualizado ou não gera resultados','Tenho apenas redes sociais','Não tenho, mas quero ter','Não preciso de site neste momento']},
  {name:'wants_system', label:'Pretende contratar ou implementar um sistema?', options:['Sim, quero resolver isso agora','Sim, nos próximos 3 meses','Talvez, preciso entender as opções','Não neste momento','Já tenho sistemas e quero integrá-los ou melhorá-los']},
  {name:'improvement_investment', label:'Em que costuma investir para melhorar seu negócio?', type:'textarea', placeholder:'Ex.: marketing, treinamento, sistemas, consultoria, equipamentos...'},
  {name:'monthly_budget', label:'Quanto investe por mês em tecnologia e melhorias?', options:['R$ 0 — ainda não invisto','Até R$ 100','R$ 101 a R$ 300','R$ 301 a R$ 700','R$ 701 a R$ 1.500','Mais de R$ 1.500','Varia conforme a necessidade','Prefiro não informar']}
];

function Field({q, value, onChange}) {
  return <label className="field"><span>{q.label}{q.required && <b className="req"> *</b>}</span>
    {q.options ? <select required={q.required} value={value || ''} onChange={e=>onChange(q.name,e.target.value)}><option value="">Selecione</option>{q.options.map(o=><option key={o}>{o}</option>)}</select>
      : q.type==='textarea' ? <textarea rows="3" required={q.required} value={value || ''} placeholder={q.placeholder || ''} onChange={e=>onChange(q.name,e.target.value)} />
      : <input type={q.type || 'text'} required={q.required} value={value || ''} placeholder={q.placeholder || ''} onChange={e=>onChange(q.name,e.target.value)} />}
  </label>
}

export default function App() {
  const [page,setPage] = useState(location.hash === '#admin' ? 'admin' : 'home');
  const [form,setForm] = useState(emptyForm);
  const [busy,setBusy] = useState(false);
  const [notice,setNotice] = useState('');
  const [count,setCount] = useState(null);
  const [session,setSession] = useState(null);
  const [adminRows,setAdminRows] = useState([]);
  const [search,setSearch] = useState('');
  const [statusFilter,setStatusFilter] = useState('Todos');
  const [adminLoading,setAdminLoading] = useState(false);
  const [loginEmail,setLoginEmail] = useState('');
  const [loginPassword,setLoginPassword] = useState('');

  useEffect(()=> {
    if (!supabase) return;
    supabase.rpc('registration_count').then(({data})=>{ if (typeof data === 'number') setCount(data); });
    supabase.auth.getSession().then(({data})=>setSession(data.session));
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event,s)=>setSession(s));
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{ if(page==='admin' && session) loadAdmin(); },[page,session]);

  function update(name,value){ setForm(f=>({...f,[name]:value})); }
  async function submit(e) {
    e.preventDefault(); setNotice('');
    if (!supabase) { setNotice('A conexão com o banco ainda não foi configurada.'); return; }
    if (!form.consent) { setNotice('Marque o consentimento para enviar sua inscrição.'); return; }
    setBusy(true);
    const payload = {...form}; delete payload.consent;
    const {data,error} = await supabase.rpc('register_ide_participant',{payload});
    setBusy(false);
    if(error) { setNotice(error.message.includes('SOLD_OUT') ? 'As 20 vagas já foram preenchidas. Obrigado pelo interesse!' : 'Não foi possível concluir a inscrição. Confira seus dados e tente novamente.'); return; }
    setCount(data?.registered_count ?? (count===null?null:count+1));
    setNotice('Inscrição recebida! Sua vaga será conferida manualmente. As orientações do grupo de WhatsApp serão enviadas após a confirmação.');
    setForm(emptyForm);
  }
  async function login(e) {
    e.preventDefault(); setNotice('');
    if(!supabase) { setNotice('Configure a conexão com o Supabase primeiro.'); return; }
    const {error} = await supabase.auth.signInWithPassword({email:loginEmail,password:loginPassword});
    if(error) setNotice('Não foi possível entrar. Confira e-mail e senha.');
    else { setNotice(''); setPage('admin'); location.hash='#admin'; }
  }
  async function loadAdmin() {
    setAdminLoading(true);
    const {data:{user}} = await supabase.auth.getUser();
    if(!user || (adminEmail && user.email.toLowerCase()!==adminEmail)) { setAdminRows([]); setAdminLoading(false); setNotice('Este usuário não está autorizado para o painel.'); return; }
    const {data,error} = await supabase.from('ide_registrations').select('*').order('created_at',{ascending:false});
    if(error) setNotice('Não foi possível carregar as inscrições. Confira as políticas de acesso no Supabase.');
    setAdminRows(data || []); setAdminLoading(false);
  }
  async function changeStatus(id,status) {
    const {error}=await supabase.from('ide_registrations').update({status}).eq('id',id);
    if(error) setNotice('Não foi possível atualizar o status.');
    else setAdminRows(rows=>rows.map(r=>r.id===id?{...r,status}:r));
  }
  async function logout(){ await supabase?.auth.signOut(); setPage('home'); location.hash=''; setAdminRows([]); }
  function exportCsv(){
    const headers=['Nome','WhatsApp','E-mail','Cidade','Função','Empresa','Desafio','Uso de IA','Nível de IA','Ferramentas IA','Sistemas','Software','Site','Quer sistema','Investimento','Orçamento mensal','Status','Data'];
    const rows=filtered.map(r=>[r.full_name,r.whatsapp,r.email,r.city,r.role,r.business_name,r.challenge,r.ai_usage,r.ai_level,r.ai_tools,r.software_usage,r.software_names,r.has_website,r.wants_system,r.improvement_investment,r.monthly_budget,r.status,r.created_at]);
    const csv=[headers,...rows].map(row=>row.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(';')).join('\r\n');
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'})); a.download='inscricoes-sala-secreta-ide.csv'; a.click(); URL.revokeObjectURL(a.href);
  }
  const filtered = useMemo(()=>adminRows.filter(r=>{
    const text=[r.full_name,r.whatsapp,r.email,r.business_name].join(' ').toLowerCase();
    return text.includes(search.toLowerCase()) && (statusFilter==='Todos'||r.status===statusFilter);
  }),[adminRows,search,statusFilter]);

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#" onClick={e=>{e.preventDefault();setPage('home');location.hash='';}} aria-label="Sala Secreta I.D.E.ia"><img className="brand-logo" src="/cardume-logo.jpg" alt="Cardume — Organizado por natureza, feito para multiplicar" /><span className="brand-divider" aria-hidden="true"></span><span className="brand-sub">SALA SECRETA <strong>I.D.E.ia</strong></span></a><button className="admin-link" onClick={()=>{setPage('admin');location.hash='#admin';}}> <LockKeyhole size={15}/> Área da tutora</button></header>
    {page==='home' ? <main>
      <section className="hero">
        <div className="glow glow-one"></div><div className="glow glow-two"></div>
        <div className="eyebrow"><Sparkles size={15}/> UMA NOVA FORMA DE TRABALHAR COM IA</div>
        <h1>Você não precisa de <em>mais ferramentas.</em><br/>Precisa fazer melhor com o que já tem.</h1>
        <p className="hero-copy">Identifica. Direciona. Expande. Uma experiência prática para organizar ideias, simplificar processos e transformar IA em resultado no trabalho.</p>
        <div className="pillars"><span><i>01</i> Identifica</span><span><i>02</i> Direciona</span><span><i>03</i> Expande</span></div>
        <div className="scarcity"><span className="live-dot"></span> Inscrições limitadas a <strong>20 participantes</strong>{count!==null && <small> · {Math.max(0,20-count)} vagas disponíveis</small>}</div>
      </section>
      <section className="form-wrap" id="inscricao">
        <div className="form-heading"><div><span className="section-kicker">ENTRADA RESTRITA</span><h2>Entre na lista de inscrição</h2><p>Preencha seus dados. A equipe vai conferir o cadastro e enviar as orientações do grupo de WhatsApp manualmente.</p></div><div className="lock-art"><LockKeyhole size={26}/></div></div>
        {!supabase && <div className="notice warning">Modo de demonstração: configure as variáveis do Supabase para receber inscrições reais.</div>}
        {notice && <div className={`notice ${notice.startsWith('Inscrição recebida')?'success':'warning'}`} role="status">{notice}</div>}
        <form onSubmit={submit}>
          <div className="form-grid">{questions.map(q=><Field key={q.name} q={q} value={form[q.name]} onChange={update}/>)}</div>
          <label className="consent"><input type="checkbox" checked={form.consent} onChange={e=>update('consent',e.target.checked)}/><span>Concordo com o uso dos dados informados para gerenciar minha inscrição e receber contato sobre a Sala Secreta I.D.E.ia. <small>Os dados não serão exibidos publicamente.</small></span></label>
          <button className="primary-btn" type="submit" disabled={busy || (count!==null&&count>=20)}>{busy?'Enviando inscrição...':count!==null&&count>=20?'Inscrições encerradas':'Enviar minha inscrição'} <ArrowRight size={17}/></button>
          <p className="privacy-note">A inscrição não adiciona você automaticamente ao grupo. O acesso será enviado após conferência.</p>
        </form>
      </section>
      <section className="bottom-note"><img className="bottom-brand-logo" src="/cardume-logo.jpg" alt="Cardume — Organizado por natureza, feito para multiplicar" /><p>Identifica <b>·</b> Direciona <b>·</b> Expande</p><small>Sala Secreta I.D.E.ia · Organizar para multiplicar.</small></section>
    </main> : <main className="admin-page">
      {!session ? <section className="login-card"><div className="lock-art"><LockKeyhole size={28}/></div><span className="section-kicker">ACESSO RESTRITO</span><h1>Painel da tutora</h1><p>Entre para consultar inscrições e confirmar o envio do acesso ao grupo.</p>{notice&&<div className="notice warning">{notice}</div>}<form onSubmit={login}><label className="field"><span>E-mail administrativo</span><input type="email" required value={loginEmail} onChange={e=>setLoginEmail(e.target.value)}/></label><label className="field"><span>Senha</span><input type="password" required value={loginPassword} onChange={e=>setLoginPassword(e.target.value)}/></label><button className="primary-btn" type="submit">Entrar no CRM <ArrowRight size={17}/></button></form></section>
      : <section className="crm">
        <div className="crm-head"><div><span className="section-kicker">SALA SECRETA I.D.E.ia</span><h1>CRM de inscrições</h1><p>Conferência manual antes de enviar o link do grupo.</p></div><button className="ghost-btn" onClick={logout}><LogOut size={16}/> Sair</button></div>
        <div className="stats"><div><Users/><span>Total de cadastros</span><strong>{adminRows.length}</strong></div><div><CheckCircle2/><span>Confirmados</span><strong>{adminRows.filter(r=>r.status==='Confirmado').length}</strong></div><div><MessageCircle/><span>Link enviado</span><strong>{adminRows.filter(r=>r.status==='Link enviado').length}</strong></div><div><LockKeyhole/><span>Vagas restantes</span><strong>{Math.max(0,20-adminRows.length)}</strong></div></div>
        <div className="table-tools"><label className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar nome, WhatsApp ou empresa"/></label><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>Todos</option><option>Inscrito</option><option>Contato realizado</option><option>Confirmado</option><option>Link enviado</option><option>Desistiu</option></select><button className="ghost-btn" onClick={exportCsv}><Download size={16}/> Exportar CSV</button><button className="ghost-btn" onClick={loadAdmin}>Atualizar</button></div>
        {adminLoading?<p>Carregando inscrições...</p>:filtered.length===0?<div className="empty-state"><Users size={30}/><p>Nenhuma inscrição encontrada com esses filtros.</p></div>:<div className="table-scroll"><table><thead><tr><th>Participante</th><th>Contato</th><th>Perfil / IA</th><th>Interesse</th><th>Status</th><th>Ação</th></tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td><strong>{r.full_name}</strong><small>{r.business_name||r.role||'—'}</small><small>{new Date(r.created_at).toLocaleString('pt-BR')}</small></td><td><a href={`https://wa.me/55${String(r.whatsapp||'').replace(/\D/g,'').replace(/^55/,'')}`} target="_blank" rel="noreferrer">{r.whatsapp}</a><small>{r.email}</small><small>{r.city}</small></td><td><span>{r.ai_usage||'—'}</span><small>{r.ai_level||'Nível não informado'}</small><small>{r.ai_tools||''}</small></td><td><small>Site: {r.has_website||'—'}</small><small>Sistema: {r.wants_system||'—'}</small><small>Investimento: {r.monthly_budget||'—'}</small></td><td><select className="status-select" value={r.status} onChange={e=>changeStatus(r.id,e.target.value)}><option>Inscrito</option><option>Contato realizado</option><option>Confirmado</option><option>Link enviado</option><option>Desistiu</option></select></td><td><button className="mini-btn" title="Abrir WhatsApp" onClick={()=>window.open(`https://wa.me/55${String(r.whatsapp||'').replace(/\D/g,'').replace(/^55/,'')}`,'_blank','noopener')}>WhatsApp</button><button className="mini-btn secondary" onClick={()=>alert(`Desafio: ${r.challenge||'—'}\nSoftwares: ${r.software_names||'—'}\nInvestimento: ${r.improvement_investment||'—'}`)}>Ver respostas</button></td></tr>)}</tbody></table></div>}
        <p className="admin-hint">Fluxo recomendado: Inscrito → Contato realizado → Confirmado → Link enviado. Só marque “Link enviado” depois de enviar o convite do WhatsApp.</p>
      </section>}
    </main>}
    <footer>© Sala Secreta I.D.E.ia <span>•</span> Identifica · Direciona · Expande</footer>
  </div>;
}