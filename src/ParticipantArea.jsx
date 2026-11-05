import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  LockKeyhole, ArrowRight, ChevronLeft, ChevronRight, Plus, Trash2,
  Download, Printer, LogOut, Sparkles, Pencil, Save, X, ListTodo, CalendarDays, GripVertical
} from 'lucide-react';
import './participant.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const db = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const TABLE = 'ideia_mindmaps';

const qs = [
  { key: 'area', label: 'Em qual área você mais precisa de ajuda?', options: ['Organização e produtividade', 'Criação de conteúdo e redes sociais', 'Gestão do negócio ou projetos', 'Comunicação e atendimento', 'Estudos e aperfeiçoamento', 'Outra'] },
  { key: 'goal', label: 'Qual seu principal objetivo com IA?', options: ['Ganhar tempo e produzir mais', 'Organizar rotina e projetos', 'Criar conteúdos com facilidade', 'Melhorar processos do negócio', 'Automatizar tarefas repetitivas', 'Analisar informações e decidir melhor'] },
  { key: 'level', label: 'Como você usa IA atualmente?', options: ['Ainda não uso', 'Já testei, mas uso raramente', 'Uso de vez em quando', 'Uso toda semana', 'Uso diariamente'] },
  { key: 'tools', label: 'Quais ferramentas você utiliza?', text: true, placeholder: 'Ex.: ChatGPT, Gemini, Canva IA ou nenhuma' },
  { key: 'tasks', label: 'Quais tarefas mais consomem seu tempo?', multi: ['Responder mensagens e e-mails', 'Criar textos, artes e conteúdos', 'Organizar agenda e prioridades', 'Pesquisar e reunir informações', 'Preencher planilhas e relatórios', 'Atender clientes e acompanhar leads', 'Executar tarefas repetitivas'] },
  { key: 'social', label: 'Como organiza sua presença digital?', options: ['Tenho calendário e posts programados', 'Tenho calendário, mas publico manualmente', 'Publico quando sobra tempo', 'Quero começar a produzir conteúdo', 'Não trabalho com redes sociais'] },
  { key: 'systems', label: 'Quais sistemas ou processos gostaria de melhorar?', text: true, placeholder: 'Ex.: planilhas, CRM, atendimento, vendas, financeiro...' },
  { key: 'first', label: 'Qual resultado prático gostaria de alcançar primeiro?', text: true, placeholder: 'Descreva uma tarefa ou processo que gostaria de simplificar com IA.' }
];

const blank = Object.fromEntries(qs.map(q => [q.key, q.multi ? [] : '']));

const showAnswer = value => Array.isArray(value) ? value.join(' • ') : (value || 'Não informado');

export default function ParticipantArea() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [answers, setAnswers] = useState(blank);
  const [step, setStep] = useState(0);
  const [map, setMap] = useState(null);
  const [savedMap, setSavedMap] = useState(null);
  const [revisingDiagnosis, setRevisingDiagnosis] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('media');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskBusy, setTaskBusy] = useState(false);
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [classPlan, setClassPlan] = useState(null);

  useEffect(() => {
    if (!db) {
      setNotice('A conexão com o Supabase não está configurada.');
      setLoading(false);
      return;
    }
    let mounted = true;
    db.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setNotice(`Não foi possível recuperar sua sessão: ${error.message}`);
      setSession(data?.session || null);
    });
    const { data: { subscription } } = db.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!db || !session) {
      setAllowed(false);
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      setLoading(true);
      setNotice('');
      try {
        const { data: canAccess, error: accessError } = await db.rpc('can_access_ideia_workspace');
        if (!active) return;
        if (accessError) throw new Error(`Falha ao validar autorização: ${accessError.message}`);
        if (!canAccess) {
          setAllowed(false);
          setNotice('Acesso ainda não liberado para este e-mail. A participação precisa estar confirmada.');
          await db.auth.signOut();
          if (active) setLoading(false);
          return;
        }

        setAllowed(true);
        const { data, error: loadError } = await db
          .from(TABLE)
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_free', true)
          .maybeSingle();
        if (loadError) throw new Error(`Falha ao carregar seu mapa: ${loadError.message}`);
        if (!active) return;
        if (data) {
          setMap(data);
          setSavedMap(data);
          setAnswers({ ...blank, ...(data.answers || {}) });
        } else {
          setMap(null);
          setSavedMap(null);
        }

        setTasksLoading(true);
        const { data: taskRows, error: taskError } = await db
          .from('ideia_participant_tasks')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        if (!active) return;
        if (taskError) {
          console.warn('Kanban pessoal indisponível; pode faltar a migração:', taskError);
          setTasks([]);
        } else {
          setTasks(taskRows || []);
        }
        setTasksLoading(false);

        const { data: publishedPlan, error: classPlanError } = await db
          .from('ideia_class_plans')
          .select('*')
          .eq('id', 1)
          .eq('is_published', true)
          .maybeSingle();
        if (classPlanError) {
          console.warn('Mapa da aula ainda não publicado ou migração pendente:', classPlanError);
          setClassPlan(null);
        } else {
          setClassPlan(publishedPlan || null);
        }
      } catch (error) {
        if (active) {
          setTasksLoading(false);
          setNotice(error.message || 'Não foi possível carregar sua área.');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [session]);

  async function createTask(event) {
    event.preventDefault();
    const title = taskTitle.trim();
    if (!title || !db || !session) return;
    setTaskBusy(true);
    setNotice('');
    try {
      const { data, error } = await db.from('ideia_participant_tasks').insert({
        user_id: session.user.id,
        title,
        description: taskDescription.trim(),
        priority: taskPriority,
        due_date: taskDueDate || null,
        status: 'para_fazer'
      }).select('*').single();
      if (error) throw error;
      setTasks(current => [data, ...current]);
      setTaskTitle('');
      setTaskDescription('');
      setTaskPriority('media');
      setTaskDueDate('');
      setNotice('Tarefa adicionada ao seu Kanban.');
    } catch (error) {
      console.error('Falha ao criar tarefa:', error);
      setNotice(`Não foi possível adicionar a tarefa: ${error.message || 'erro inesperado'}`);
    } finally {
      setTaskBusy(false);
    }
  }

  async function addClassActionToKanban(title, stage) {
    if (!db || !session) return;
    if (tasks.some(task => task.title.toLowerCase() === String(title).toLowerCase())) {
      setNotice('Essa ação já está no seu Kanban.');
      return;
    }
    setTaskBusy(true);
    const { data, error } = await db.from('ideia_participant_tasks').insert({
      user_id: session.user.id,
      title: String(title).slice(0,120),
      description: 'Ação da aula · ' + stage,
      priority: 'media',
      status: 'para_fazer'
    }).select('*').single();
    setTaskBusy(false);
    if (error) {
      setNotice('Não foi possível adicionar a ação ao Kanban: ' + error.message);
      return;
    }
    setTasks(current=>[data,...current]);
    setNotice('Ação adicionada ao seu Kanban pessoal.');
  }

  async function moveTask(task, status) {
    if (!db || !session || task.status === status) return;
    const previous = tasks;
    setTasks(current => current.map(item => item.id === task.id ? { ...item, status } : item));
    const { data, error } = await db.from('ideia_participant_tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', task.id)
      .eq('user_id', session.user.id)
      .select('*')
      .single();
    if (error) {
      setTasks(previous);
      setNotice(`Não foi possível mover a tarefa: ${error.message}`);
      return;
    }
    setTasks(current => current.map(item => item.id === task.id ? data : item));
  }

  async function removeTask(task) {
    if (!db || !session) return;
    if (!window.confirm(`Excluir a tarefa "${task.title}"?`)) return;
    const previous = tasks;
    setTasks(current => current.filter(item => item.id !== task.id));
    const { error } = await db.from('ideia_participant_tasks').delete()
      .eq('id', task.id).eq('user_id', session.user.id);
    if (error) {
      setTasks(previous);
      setNotice(`Não foi possível excluir a tarefa: ${error.message}`);
      return;
    }
    setNotice('Tarefa excluída.');
  }

  function onTaskDrop(event, status) {
    event.preventDefault();
    const task = tasks.find(item => item.id === draggingTaskId);
    if (task) moveTask(task, status);
    setDraggingTaskId(null);
  }

  async function send(event) {
    event.preventDefault();
    if (!db) {
      setNotice('A conexão com o Supabase não está configurada.');
      return;
    }
    setBusy(true);
    setNotice('');
    try {
      const { error } = await db.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/participante`,
          shouldCreateUser: true
        }
      });
      if (error) throw error;
      setNotice('Link enviado. Confira sua caixa de entrada e também o spam.');
    } catch (error) {
      console.error('Falha no envio do magic link:', error);
      setNotice(`Não foi possível enviar o link: ${error.message || 'erro inesperado'}`);
    } finally {
      setBusy(false);
    }
  }

  async function save(nextAnswers = answers, nextNodes = [], successMessage = 'Diagnóstico salvo com sucesso.') {
    if (!db || !session) {
      setNotice('Sua sessão expirou. Entre novamente para salvar.');
      return false;
    }
    setBusy(true);
    setNotice('');
    try {
      const { data, error } = await db
        .from(TABLE)
        .upsert({
          user_id: session.user.id,
          title: 'Meu Plano I.D.E.ia',
          answers: nextAnswers,
          mindmap: nextNodes,
          is_free: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select('*')
        .single();
      if (error) throw error;
      setMap(data);
      setSavedMap(data);
      setAnswers({ ...blank, ...(data.answers || {}) });
      setNotice(successMessage);
      return true;
    } catch (error) {
      console.error('Falha ao salvar o mapa I.D.E.ia:', error);
      setNotice(`Não foi possível salvar: ${error.message || 'erro inesperado'}`);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function finishDiagnosis() {
    const ok = await save(
      answers,
      [],
      'Diagnóstico salvo. A tutora preparará o resumo da aula e, depois, o mapa de ações.'
    );
    if (ok) {
      setRevisingDiagnosis(false);
    }
  }

  function exportMap() {
    if (!classPlan?.mindmap?.length) return;
    const blob = new Blob([JSON.stringify(classPlan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'mapa-da-aula-ideia.json';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function printMap() {
    if (!classPlan?.mindmap?.length) {
      setNotice('O mapa da aula ainda não foi disponibilizado pela tutora.');
      return;
    }
    window.print();
  }

  function renderQuestionnaire() {
    const question = qs[step];
    const isLast = step === qs.length - 1;
    return (
      <>
        <small>DIAGNÓSTICO I.D.E.ia · PERGUNTA {step + 1} DE {qs.length}</small>
        <div className="pa-progress"><i style={{ width: `${((step + 1) / qs.length) * 100}%` }} /></div>
        <h2>{question.label}</h2>
        {question.multi ? (
          <div className="pa-options">
            {question.multi.map(option => (
              <label key={option}>
                <input
                  type="checkbox"
                  checked={(answers[question.key] || []).includes(option)}
                  onChange={event => setAnswers(current => ({
                    ...current,
                    [question.key]: event.target.checked
                      ? [...(current[question.key] || []), option]
                      : (current[question.key] || []).filter(item => item !== option)
                  }))}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        ) : question.options ? (
          <div className="pa-options">
            {question.options.map(option => (
              <label key={option}>
                <input
                  type="radio"
                  name={question.key}
                  checked={answers[question.key] === option}
                  onChange={() => setAnswers(current => ({ ...current, [question.key]: option }))}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        ) : (
          <textarea
            rows={3}
            placeholder={question.placeholder}
            value={answers[question.key] || ''}
            onChange={event => setAnswers(current => ({ ...current, [question.key]: event.target.value }))}
          />
        )}
        <div className="pa-actions">
          <button
            className="secondary"
            disabled={step === 0 || busy}
            onClick={() => setStep(current => Math.max(0, current - 1))}
          >
            <ChevronLeft size={17} /> Voltar
          </button>
          {isLast ? (
            <button
              onClick={map ? finishDiagnosis : async () => {
                const ok = await save(answers, [], 'Diagnóstico enviado. O mapa da aula será disponibilizado depois que a tutora preparar o planejamento.');
                if (ok) {
                  setStep(0);
                }
              }}
              disabled={busy || qs.some(item => {
                const value = answers[item.key];
                return Array.isArray(value) ? value.length === 0 : !String(value || '').trim();
              })}
            >
              {busy ? 'Salvando...' : map ? 'Salvar diagnóstico e atualizar mapa' : 'Gerar e salvar meu mapa'}
              <Sparkles size={17} />
            </button>
          ) : (
            <button onClick={() => setStep(current => Math.min(qs.length - 1, current + 1))} disabled={busy}>
              Próxima <ChevronRight size={17} />
            </button>
          )}
        </div>
      </>
    );
  }

  if (loading) return <div className="pa-gate"><div className="pa-spinner" /></div>;
  if (!db) {
    return (
      <div className="pa-gate">
        <section className="pa-login">
          <div className="pa-lock"><LockKeyhole /></div>
          <small>CONFIGURAÇÃO NECESSÁRIA</small>
          <h1>Estamos preparando seu espaço.</h1>
          <p>{notice || 'A conexão com o Supabase não está configurada.'}</p>
          <small>Esta mensagem não afeta o site principal.</small>
        </section>
      </div>
    );
  }
  if (!session || !allowed) {
    return (
      <div className="pa-gate">
        <section className="pa-login">
          <div className="pa-lock"><LockKeyhole /></div>
          <small>ACESSO INDIVIDUAL</small>
          <h1>Sua jornada começa aqui.</h1>
          <p>Informe o e-mail utilizado na inscrição. Enviaremos um link seguro para acessar seu diagnóstico e mapa mental.</p>
          {notice && <div className="pa-notice">{notice}</div>}
          <form onSubmit={send}>
            <label>Seu e-mail<input type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="voce@email.com" /></label>
            <button disabled={busy}>{busy ? 'Enviando...' : <>Enviar link de acesso <ArrowRight size={17} /></>}</button>
          </form>
          <small>Área privada para participantes autorizados.</small>
        </section>
      </div>
    );
  }

  const canStartQuiz = !map || revisingDiagnosis;
  const missingAnswers = qs.some(item => {
    const value = answers[item.key];
    return Array.isArray(value) ? value.length === 0 : !String(value || '').trim();
  });

  return (
    <div className="pa-shell">
      <aside className="pa-side">
        <div className="pa-brand"><LockKeyhole /> <b>Sala Secreta<br /><strong>I.D.E.ia</strong></b></div>
        <nav>
          <a href="#inicio">⌂ Meu Espaço</a>
          <a className={canStartQuiz ? 'active' : ''} href="#quiz">▤ Diagnóstico</a>
          <a className={map ? '' : 'disabled'} href={map ? '#mapa' : '#quiz'}>⌘ Meu Mapa Mental</a>
          <a href="#tarefas">☷ Minhas tarefas</a>
        </nav>
        <button className="pa-logout" onClick={() => db.auth.signOut()}><LogOut size={16} /> Sair</button>
      </aside>

      <main className="pa-main" id="inicio">
        <header className="pa-hero">
          <small>SUA JORNADA I.D.E.ia</small>
          <h1>Bem-vindo(a) à sua Sala Secreta. 💜</h1>
          <p>Diagnostique sua rotina, descubra oportunidades e transforme ideias em ações com IA.</p>
        </header>
        <div className="pa-steps"><span>1 · Diagnóstico</span><span>2 · Mapa mental</span><span>3 · Ação</span></div>

        <section className="pa-card pa-diagnosis" id="quiz">
          {map && !revisingDiagnosis ? (
            <>
              <small>SEU DIAGNÓSTICO I.D.E.ia</small>
              <h2>Suas respostas</h2>
              <div className="pa-answer-list">
                {qs.map(question => (
                  <article key={question.key}>
                    <strong>{question.label}</strong>
                    <p>{showAnswer(answers[question.key])}</p>
                  </article>
                ))}
              </div>
              <div className="pa-actions">
                <span>Você pode revisar suas respostas e atualizar seu mapa.</span>
                <button onClick={() => { setStep(0); setRevisingDiagnosis(true); }}>
                  <Pencil size={16} /> Revisar diagnóstico
                </button>
              </div>
            </>
          ) : (
            <>
              {map && <div className="pa-diagnosis-head"><small>REVISAR DIAGNÓSTICO</small><button className="secondary" onClick={() => { setRevisingDiagnosis(false); setStep(0); setAnswers({ ...blank, ...(savedMap?.answers || {}) }); }} disabled={busy}><X size={16} /> Cancelar</button></div>}
              {renderQuestionnaire()}
            </>
          )}
        </section>

        {map && (
          <section className="pa-card pa-class-map" id="mapa">
            {classPlan?.mindmap?.length ? (
              <>
                <div className="pa-maphead">
                  <div>
                    <small>MAPA MENTAL DA AULA · DISPONIBILIZADO PELA TUTORA</small>
                    <h2>{classPlan.title || 'Mapa de ações I.D.E.ia'}</h2>
                    <p>{classPlan.summary}</p>
                  </div>
                  <div className="pa-map-tools">
                    <button className="secondary" onClick={exportMap} title="Baixar mapa" aria-label="Baixar mapa"><Download size={16}/></button>
                    <button className="secondary" onClick={printMap} title="Imprimir ou salvar como PDF" aria-label="Imprimir mapa"><Printer size={16}/></button>
                  </div>
                </div>
                <div className="pa-map pa-mindmap">
                  <div className="pa-mindmap-root"><span>IDEIA CENTRAL</span><strong>{classPlan.title || 'Aula I.D.E.ia'}</strong></div>
                  <svg className="pa-mindmap-lines" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
                    <path className="line-root-i" d="M500 350 C430 350 400 350 320 350"/>
                    <path className="line-root-d" d="M500 350 C570 300 610 190 685 180"/>
                    <path className="line-root-e" d="M500 350 C570 410 610 510 685 520"/>
                  </svg>
                  <div className="pa-mindmap-groups">
                    {classPlan.mindmap.map(node=>(
                      <section key={node.id} className={'pa-mindmap-group '+node.id}>
                        <div className="pa-mindmap-branch"><span>{node.id==='i'?'01':node.id==='d'?'02':'03'}</span><strong>{node.title}</strong></div>
                        <div className="pa-mindmap-children">
                          {(node.items||[]).map((item,index)=>(
                            <div className="pa-mindmap-child" key={index}>
                              <span className="pa-child-dot"/>
                              <span className="pa-mindmap-child-text">{item}</span>
                              <button className="pa-add-task" onClick={()=>addClassActionToKanban(item,node.title)} disabled={tasks.some(task=>task.title.toLowerCase()===String(item).toLowerCase())}>+ Kanban</button>
                            </div>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                  <p className="pa-mindmap-caption">Este mapa foi criado pela tutora depois de analisar as respostas e definir as ações da aula.</p>
                </div>
                <div className="pa-class-plan-summary">
                  <strong>Resultado esperado</strong><p>{classPlan.objective}</p>
                  <strong>Ferramentas</strong><p>{(classPlan.tools||[]).join(' · ')}</p>
                  <strong>Entregáveis</strong><p>{(classPlan.deliverables||[]).join(' · ')}</p>
                </div>
              </>
            ) : (
              <div className="pa-class-map-pending">
                <Sparkles size={28}/>
                <small>DIAGNÓSTICO RECEBIDO</small>
                <h2>Seu mapa de ações está sendo preparado.</h2>
                <p>Suas respostas ajudam a tutora a entender suas necessidades. Depois de planejar a aula e definir as ações de Identifica, Direciona e Expande, ela disponibilizará aqui o mapa mental.</p>
              </div>
            )}
          </section>
        )}

        {map && (
          <section className="pa-card pa-personal-kanban" id="tarefas">
            <div className="pa-maphead">
              <div>
                <small>ETAPA 3 · AÇÃO</small>
                <h2>Meu Kanban de tarefas</h2>
                <p>Organize as ações da aula e suas próprias tarefas. Mova cada cartão conforme avançar.</p>
              </div>
              <div className="pa-kanban-total"><ListTodo size={20}/><strong>{tasks.length}</strong><span>tarefas</span></div>
            </div>

            <form className="pa-task-form" onSubmit={createTask}>
              <div className="pa-task-form-main">
                <label>O que você precisa fazer?
                  <input value={taskTitle} onChange={event=>setTaskTitle(event.target.value)} placeholder="Ex.: Criar calendário de conteúdo com IA" maxLength={120} required />
                </label>
                <label>Detalhes (opcional)
                  <input value={taskDescription} onChange={event=>setTaskDescription(event.target.value)} placeholder="Descreva a próxima ação ou o resultado esperado" maxLength={400} />
                </label>
              </div>
              <div className="pa-task-form-options">
                <label>Prioridade
                  <select value={taskPriority} onChange={event=>setTaskPriority(event.target.value)}>
                    <option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option>
                  </select>
                </label>
                <label>Prazo
                  <input type="date" value={taskDueDate} onChange={event=>setTaskDueDate(event.target.value)} />
                </label>
                <button type="submit" disabled={taskBusy || !taskTitle.trim()}><Plus size={16}/>{taskBusy?'Adicionando...':'Adicionar tarefa'}</button>
              </div>
            </form>

            {tasksLoading ? <div className="pa-task-loading">Carregando suas tarefas...</div> : (
              <div className="pa-personal-kanban-columns">
                {[
                  {id:'para_fazer',title:'Para fazer',tone:'todo',hint:'Planeje a próxima ação'},
                  {id:'em_andamento',title:'Em andamento',tone:'doing',hint:'O que você está executando'},
                  {id:'feito',title:'Feito',tone:'done',hint:'Conquistas concluídas'}
                ].map(column=>{
                  const columnTasks=tasks.filter(task=>task.status===column.id);
                  return (
                    <section className={'pa-task-column '+column.tone} key={column.id}
                      onDragOver={event=>event.preventDefault()}
                      onDrop={event=>onTaskDrop(event,column.id)}>
                      <header>
                        <div><strong>{column.title}</strong><small>{column.hint}</small></div>
                        <b>{columnTasks.length}</b>
                      </header>
                      <div className="pa-task-cards">
                        {columnTasks.map(task=>(
                          <article className={'pa-task-card '+(draggingTaskId===task.id?'is-dragging':'')} key={task.id}
                            draggable
                            onDragStart={()=>setDraggingTaskId(task.id)}
                            onDragEnd={()=>setDraggingTaskId(null)}>
                            <div className="pa-task-card-top">
                              <span className={'pa-task-priority '+task.priority}>{task.priority==='alta'?'Prioridade alta':task.priority==='baixa'?'Prioridade baixa':'Prioridade média'}</span>
                              <button type="button" onClick={()=>removeTask(task)} aria-label={'Excluir tarefa '+task.title}><Trash2 size={14}/></button>
                            </div>
                            <h3><GripVertical size={14}/>{task.title}</h3>
                            {task.description&&<p>{task.description}</p>}
                            {task.due_date&&<small className="pa-task-due"><CalendarDays size={13}/> Prazo: {new Date(task.due_date+'T12:00:00').toLocaleDateString('pt-BR')}</small>}
                            <label className="pa-task-move">Mover para
                              <select value={task.status} onChange={event=>moveTask(task,event.target.value)}>
                                <option value="para_fazer">Para fazer</option>
                                <option value="em_andamento">Em andamento</option>
                                <option value="feito">Feito</option>
                              </select>
                            </label>
                          </article>
                        ))}
                        {columnTasks.length===0&&<div className="pa-task-empty">Nenhuma tarefa aqui ainda.</div>}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
            <p className="pa-kanban-footnote">Este quadro é particular: somente você visualiza e organiza suas tarefas. Arraste os cartões ou use o campo “Mover para”.</p>
          </section>
        )}

        {notice && <div className="pa-notice" role="status">{notice}</div>}
        <aside className="pa-upsell">
          <div><small>QUER IR ALÉM?</small><h3>Crie novos mapas para novos projetos.</h3><p>Seu acesso gratuito inclui um diagnóstico e um mapa mental. A assinatura de R$ 9,90/mês será ativada em uma próxima etapa.</p></div>
          <b>R$ 9,90<small>/mês</small></b>
        </aside>
      </main>
    </div>
  );
}
