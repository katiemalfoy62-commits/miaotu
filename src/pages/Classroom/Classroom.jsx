import React, { useMemo, useState } from 'react'
import { CheckCircle, ChevronRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import useStore from '../../store/useStore'
import BlinkingClayMascot from '../../components/Cat/BlinkingClayMascot'
import { CLASSROOM_PATHS } from '../../data/classroomLessons'

export default function Classroom() {
  const { classroom = { completedLessons: [] }, completeLesson, addExp, addFish } = useStore()
  const [pathId, setPathId] = useState(CLASSROOM_PATHS[0].id)
  const [lessonId, setLessonId] = useState(CLASSROOM_PATHS[0].lessons[0].id)
  const completed = classroom.completedLessons || []

  const activePath = CLASSROOM_PATHS.find(path => path.id === pathId) || CLASSROOM_PATHS[0]
  const activeLesson = activePath.lessons.find(lesson => lesson.id === lessonId) || activePath.lessons[0]
  const isDone = completed.some(item => item.id === activeLesson.id)
  const progress = useMemo(() => {
    const total = CLASSROOM_PATHS.reduce((sum, path) => sum + path.lessons.length, 0)
    return Math.round((completed.length / total) * 100)
  }, [completed.length])

  function choosePath(path) {
    setPathId(path.id)
    setLessonId(path.lessons[0].id)
  }

  function finishLesson() {
    if (isDone) return
    completeLesson({ ...activeLesson, path: activePath.title })
    addExp(5)
    addFish(1)
  }

  return (
    <div className="classroom-shell">
      <section className="classroom-hero card">
        <div>
          <div className="section-kicker">知识补给</div>
          <h1>小猫课堂</h1>
          <p>先把 AI PM 的基础概念装进脑子里，再去做题、面试和造物。每节课都很短，只讲一个关键概念。</p>
        </div>
        <BlinkingClayMascot type="kivi" className="classroom-hero-cat" />
        <div className="classroom-progress">
          <span>完成进度</span>
          <strong>{progress}%</strong>
          <i><b style={{ width: `${progress}%` }} /></i>
        </div>
      </section>

      <div className="classroom-grid">
        <aside className="classroom-paths">
          {CLASSROOM_PATHS.map(path => (
            <button
              type="button"
              key={path.id}
              className={`classroom-path classroom-path--${path.tone} ${path.id === activePath.id ? 'is-active' : ''}`}
              onClick={() => choosePath(path)}
            >
              <strong>{path.title}</strong>
              <span>{path.subtitle}</span>
            </button>
          ))}
        </aside>

        <main className="classroom-main card">
          <div className="classroom-lesson-list">
            {activePath.lessons.map(lesson => {
              const done = completed.some(item => item.id === lesson.id)
              return (
                <button
                  type="button"
                  key={lesson.id}
                  className={`classroom-lesson-tab ${lesson.id === activeLesson.id ? 'is-active' : ''}`}
                  onClick={() => setLessonId(lesson.id)}
                >
                  {done && <CheckCircle size={14} />}
                  <span>{lesson.title}</span>
                  <ChevronRight size={15} />
                </button>
              )
            })}
          </div>

          <motion.article
            key={activeLesson.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="classroom-article"
          >
            <div className="classroom-article-head">
              <span>{activeLesson.duration}</span>
              <h2>{activeLesson.title}</h2>
              <p>{activeLesson.example}</p>
            </div>

            <div className="classroom-definition">
              <span>专业定义</span>
              <p>{activeLesson.definition || activeLesson.body}</p>
            </div>

            <div className="classroom-plain">
              <span>人话解释</span>
              <strong>{activeLesson.plain || activeLesson.takeaway}</strong>
            </div>

            <div className="classroom-points">
              <span className="classroom-block-title">关键点</span>
              {activeLesson.bullets.map(point => (
                <div key={point}><Sparkles size={15} /> {point}</div>
              ))}
            </div>

            <div className="classroom-study-grid">
              <article>
                <span>真实场景</span>
                <p>{activeLesson.scenario || activeLesson.example}</p>
              </article>
              <article>
                <span>常见误区</span>
                <p>{activeLesson.mistake || '只记概念名，但不知道它解决什么真实问题。'}</p>
              </article>
              <article>
                <span>小练习</span>
                <p>{activeLesson.exercise || '用你自己的项目举一个例子，写出用户、场景和判断标准。'}</p>
              </article>
              <article>
                <span>老猫提示</span>
                <p>{activeLesson.mentor || activeLesson.takeaway}</p>
              </article>
            </div>

            <div className="classroom-takeaway">
              <span>记住这句</span>
              <strong>{activeLesson.takeaway}</strong>
            </div>

            <button type="button" className={`btn-primary classroom-done-button ${isDone ? 'is-done' : ''}`} onClick={finishLesson}>
              <CheckCircle size={16} />
              {isDone ? '已经学过' : '我学完了'}
            </button>
          </motion.article>
        </main>
      </div>
    </div>
  )
}
