import React from 'react'
import intj from '../../assets/interviewers/interviewer-intj.png'
import intp from '../../assets/interviewers/interviewer-intp.png'
import entj from '../../assets/interviewers/interviewer-entj.png'
import entp from '../../assets/interviewers/interviewer-entp.png'
import infj from '../../assets/interviewers/interviewer-infj.png'
import infp from '../../assets/interviewers/interviewer-infp.png'
import enfj from '../../assets/interviewers/interviewer-enfj.png'
import enfp from '../../assets/interviewers/interviewer-enfp.png'
import istj from '../../assets/interviewers/interviewer-istj.png'
import isfj from '../../assets/interviewers/interviewer-isfj.png'
import estj from '../../assets/interviewers/interviewer-estj.png'
import esfj from '../../assets/interviewers/interviewer-esfj.png'
import istp from '../../assets/interviewers/interviewer-istp.png'
import isfp from '../../assets/interviewers/interviewer-isfp.png'
import estp from '../../assets/interviewers/interviewer-estp.png'
import esfp from '../../assets/interviewers/interviewer-esfp.png'

const interviewerImages = {
  INTJ: intj,
  INTP: intp,
  ENTJ: entj,
  ENTP: entp,
  INFJ: infj,
  INFP: infp,
  ENFJ: enfj,
  ENFP: enfp,
  ISTJ: istj,
  ISFJ: isfj,
  ESTJ: estj,
  ESFJ: esfj,
  ISTP: istp,
  ISFP: isfp,
  ESTP: estp,
  ESFP: esfp,
}

export default function InterviewerClay({ interviewer, size = 60, className = '' }) {
  const src = interviewerImages[interviewer?.mbti] || entj

  return (
    <img
      src={src}
      alt={interviewer?.nameEn || interviewer?.name || 'Clay interviewer'}
      className={`interviewer-clay ${className}`}
      style={{ width: size, height: size * 1.08 }}
      draggable="false"
    />
  )
}
