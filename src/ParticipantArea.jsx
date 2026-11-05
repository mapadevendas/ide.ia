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
const makeMap = answers => [
  { id: 'i', title: 'I · IDENTIFICA', items: [(answers.tasks || []).join(', ') || 'Mapear tarefas que consomem tempo', answers.systems || 'Identificar processos a melhorar', answers.area || 'Definir área prioritária'] },
  { id: 'd', title: 'D · DIRECIONA', items: [answers.tools || 'Selecionar ferramentas de IA', answers.level || 'Definir próximo nível de uso', answers.social || 'Planejar aplicação na rotina'] },
  { id: 'e', title: 'E · EXPANDE', items: [answers.goal || 'Definir resultado esperado', answers.first || 'Escolher primeira aplicação', 'Medir ganhos de tempo e produtividade'] }
];
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
  const [edit, setEdit] = useState(false);
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
        if (taskError) throw new Error(`Falha ao carregar seu Kanban: ${taskError.message}`);
        if (!active) return;
        setTasks(taskRows || []);
        setTasksLoading(false);
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
      setNotice(\`Não foi possível adicionar a tarefa: \${error.message || 'erro inesperado'}\`);
    } finally {
      setTaskBusy(false);
    }
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
      setNotice(\`Não foi possível mover a tarefa: \${error.message}\`);
      return;
    }
    setTasks(current => current.map(item => item.id === task.id ? data : item));
  }

  async function removeTask(task) {
    if (!db || !session) return;
    if (!window.confirm(\`Excluir a tarefa "\${task.title}"?\`)) return;
    const previous = tasks;
    setTasks(current => current.filter(item => item.id !== task.id));
    const { error } = await db.from('ideia_participant_tasks').delete()
      .eq('id', task.id).eq('user_id', session.user.id);
    if (error) {
      setTasks(previous);
      setNotice(\`Não foi possível excluir a tarefa: \${error.message}\`);
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

  async function save(nextAnswers = answers, nextNodes = map?.mindmap || makeMap(answers), successMessage = 'Mapa salvo com sucesso.') {
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

  function changeNode(id, index, value) {
    setMap(current => ({
      ...current,
      mindmap: current.mindmap.map(node => node.id === id
        ? { ...node, items: node.items.map((item, itemIndex) => itemIndex === index ? value : item) }
        : node)
    }));
  }

  function addNode(id) {
    setMap(current => ({
      ...current,
      mindmap: current.mindmap.map(node => node.id === id
        ? { ...node, items: [...node.items, 'Nova ideia'] }
        : node)
    }));
  }

  function deleteNode(id, index) {
    setMap(current => ({
      ...current,
      mindmap: current.mindmap.map(node => node.id === id
        ? { ...node, items: node.items.filter((_, itemIndex) => itemIndex !== index) }
        : node)
    }));
  }

  async function toggleMapEdit() {
    if (!edit) {
      setEdit(true);
      return;
    }
    const ok = await save(answers, map?.mindmap || makeMap(answers));
    if (ok) setEdit(false);
  }

  function cancelMapEdit() {
    setMap(savedMap);
    setEdit(false);
    setNotice('Alterações descartadas. O mapa salvo anteriormente foi restaurado.');
  }

  async function finishDiagnosis() {
    const nextMap = makeMap(answers);
    const ok = await save(
      answers,
      nextMap,
      'Diagnóstico e mapa mental atualizados e salvos.'
    );
    if (ok) {
      setRevisingDiagnosis(false);
      setEdit(false);
    }
  }

  function exportMap() {
    if (!map) return;
    const blob = new Blob([JSON.stringify(map, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'meu-mapa-ideia.json';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function printMap() {
    if (!map) {
      setNotice('Gere seu mapa mental antes de imprimir.');
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
                const ok = await save(answers, makeMap(answers), 'Diagnóstico e mapa mental criados e salvos.');
                if (ok) {
                  setStep(0);
                  setEdit(false);
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

  const nodes = map?.mindmap || makeMap(answers);
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
          <section className="pa-card" id="mapa">
            <div className="pa-maphead">
              <div>
                <small>SEU PLANO PERSONALIZADO</small>
                <h2>Meu Mapa Mental I.D.E.ia</h2>
                <p>Edite os tópicos e acrescente suas próprias ideias.</p>
              </div>
              <div className="pa-map-tools">
                <button className="secondary" onClick={toggleMapEdit} disabled={busy}>
                  {edit ? <><Save size={16} /> {busy ? 'Salvando...' : 'Salvar alterações'}</> : <><Pencil size={16} /> Editar mapa</>}
                </button>
                {edit && <button className="secondary" onClick={cancelMapEdit} disabled={busy}><X size={16} /> Cancelar</button>}
                <button className="secondary" onClick={exportMap} title="Baixar mapa em JSON" aria-label="Baixar mapa em JSON"><Download size={16} /></button>
                <button className="secondary" onClick={printMap} title="Imprimir ou salvar como PDF" aria-label="Imprimir ou salvar como PDF"><Printer size={16} /></button>
              </div>
            </div>
            <div className="pa-map pa-mindmap">
              <div className="pa-mindmap-root">
                <span>IDEIA CENTRAL</span>
                <strong>Meu Plano<br />I.D.E.ia</strong>
              </div>
              <svg className="pa-mindmap-lines" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
                <path className="line-root-i" d="M500 350 C430 350 400 350 320 350" />
                <path className="line-root-d" d="M500 350 C570 300 610 190 685 180" />
                <path className="line-root-e" d="M500 350 C570 410 610 510 685 520" />
                <path className="line-i-child" d="M320 350 C250 350 220 230 120 230 M320 350 L120 350 M320 350 C250 350 220 470 120 470" />
                <path className="line-d-child" d="M685 180 C760 180 785 100 875 100 M685 180 L875 180 M685 180 C760 180 785 260 875 260" />
                <path className="line-e-child" d="M685 520 C760 520 785 420 875 420 M685 520 L875 520 M685 520 C760 520 785 620 875 620" />
              </svg>
              <div className="pa-mindmap-groups">
                {nodes.map(node => (
                  <section key={node.id} className={'pa-mindmap-group ' + node.id}>
                    <div className="pa-mindmap-branch">
                      <span>{node.id === 'i' ? '01' : node.id === 'd' ? '02' : '03'}</span>
                      <strong>{node.title}</strong>
                    </div>
                    <div className="pa-mindmap-children">
                      {node.items.map((item, index) => (
                        <div className="pa-mindmap-child" key={index}>
                          <span className="pa-child-dot" />
                          {edit ? (
                            <div className="pa-node-edit">
                              <input
                                aria-label={`Editar ideia ${index + 1} em ${node.title}`}
                                value={item}
                                onChange={event => changeNode(node.id, index, event.target.value)}
                              />
                              <button className="pa-delete" onClick={() => deleteNode(node.id, index)} aria-label="Excluir ideia">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ) : <span className="pa-mindmap-child-text">{item}</span>}
                        </div>
                      ))}
                    </div>
                    {edit && <button className="pa-add" onClick={() => addNode(node.id)}><Plus size={14} /> Adicionar ideia</button>}
                  </section>
                ))}
              </div>
              <p className="pa-mindmap-caption">As respostas do diagnóstico se conectam à ideia central e se dividem em Identifica, Direciona e Expande. Edite os nós para construir seu plano.</p>
            </div>            {edit && <div className="pa-actions pa-save-footer"><span>As alterações ainda não foram salvas.</span><button onClick={toggleMapEdit} disabled={busy}>{busy ? 'Salvando...' : 'Salvar alterações'}</button></div>}
          </section>
        )}

        {map && (
          <section className="pa-card pa-personal-kanban" id="tarefas">
            <div className="pa-maphead">
              <div>
                <small>ETAPA 3 · AÇÃO</small>
                <h2>Meu Kanban de tarefas</h2>
                <p>Transforme seu diagnóstico em pequenas ações. Organize o que precisa fazer e acompanhe seu progresso.</p>
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
