import React from 'react'
import newsIcon from '../../assets/ui-clay/icon-news.png'
import tasksIcon from '../../assets/ui-clay/icon-tasks.png'
import trainingIcon from '../../assets/ui-clay/icon-training.png'
import interviewIcon from '../../assets/ui-clay/icon-interview.png'
import diaryEmptyIcon from '../../assets/ui-clay/icon-diary-empty.png'
import taskEmptyIcon from '../../assets/ui-clay/icon-task-empty.png'
import backIcon from '../../assets/ui-clay/icon-back.png'
import fishBowlIcon from '../../assets/ui-clay/icon-fish-bowl.png'
import archiveIcon from '../../assets/ui-clay/icon-archive.png'
import oldcatMemoryIcon from '../../assets/ui-clay/icon-oldcat-memory.png'
import interviewRecordIcon from '../../assets/ui-clay/icon-interview-record.png'

const ICONS = {
  news: newsIcon,
  tasks: tasksIcon,
  training: trainingIcon,
  interview: interviewIcon,
  diary: diaryEmptyIcon,
  taskEmpty: taskEmptyIcon,
  back: backIcon,
  fish: fishBowlIcon,
  archive: archiveIcon,
  oldcatMemory: oldcatMemoryIcon,
  interviewRecord: interviewRecordIcon,
}

export default function ClayIcon({ name, className = '', alt = '' }) {
  const src = ICONS[name] || archiveIcon
  return <img src={src} alt={alt} className={`clay-ui-icon ${className}`.trim()} draggable="false" />
}
