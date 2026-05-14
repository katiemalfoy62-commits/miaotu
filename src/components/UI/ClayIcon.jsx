import React from 'react'
import newsIcon from '../../assets/ui-clay/icon-news.webp'
import tasksIcon from '../../assets/ui-clay/icon-tasks.webp'
import trainingIcon from '../../assets/ui-clay/icon-training.webp'
import interviewIcon from '../../assets/ui-clay/icon-interview.webp'
import diaryEmptyIcon from '../../assets/ui-clay/icon-diary-empty.webp'
import taskEmptyIcon from '../../assets/ui-clay/icon-task-empty.webp'
import backIcon from '../../assets/ui-clay/icon-back.webp'
import fishBowlIcon from '../../assets/ui-clay/icon-fish-bowl.webp'
import archiveIcon from '../../assets/ui-clay/icon-archive.webp'
import oldcatMemoryIcon from '../../assets/ui-clay/icon-oldcat-memory.webp'
import interviewRecordIcon from '../../assets/ui-clay/icon-interview-record.webp'

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
