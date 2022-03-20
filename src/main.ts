import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { getRandomNumber } from './utils/getRandomNumber';
import { splitText } from './utils/splitText';

gsap.registerPlugin(ScrollTrigger);

const titleContainer = document.getElementById('title-container');
const text = document.getElementById('text');
const maskedContainer = document.getElementById('masked-container');
const maskStartPositionMarker = document.getElementById('mask-start-position-marker');


const getScrollContainerDuration = () => window.innerHeight * 3;

function getMaskedContentClipPath(position: 'beginning' | 'end') {
  if (!maskStartPositionMarker) return;
  const { top, left, width, height } = maskStartPositionMarker.getBoundingClientRect();
  const viewportMaximum = Math.max(window.innerWidth, window.innerHeight);
  const offset = position === 'end' ? viewportMaximum * 2 : 0;
  return `inset(${top - offset}px ${window.innerWidth - (left + width) - offset}px ${window.innerHeight - (top + height) - offset}px ${left - offset}px round ${viewportMaximum}px)`;
}

function getMaskedContainerTimeline(): gsap.core.Timeline {
  return gsap.timeline().fromTo(maskedContainer, { clipPath: getMaskedContentClipPath('beginning') }, { clipPath: getMaskedContentClipPath('end'), duration: 4, ease: 'sine.in' });
}

function getCharacterTimeline(element: Element): gsap.core.Timeline {
  return gsap.timeline().from(element, { x: getRandomNumber(-window.innerWidth / 4, window.innerWidth / 4), y: getRandomNumber(-window.innerHeight / 4, window.innerHeight / 4), rotate: getRandomNumber(-45, 45), scale: getRandomNumber(0.5, 2.5), duration: 1, ease: 'back.inOut' });
}

if (text) {
  const characterElements = [...text.children].map((child) => splitText(child as HTMLElement)).reduce((previous, current) => previous.concat(current));
  const titleTimeline = gsap.timeline({ scrollTrigger: {
      trigger: titleContainer,
      start: 'top top',
      end: `+=${getScrollContainerDuration()}`,
      scrub: true,
      pin: true,
    } });
  titleTimeline.add(gsap.from(titleContainer, { y: 0, duration: 1 }))
  characterElements.forEach((characterElement) => {
    titleTimeline.add(getCharacterTimeline(characterElement));
  });
  titleTimeline.add(getMaskedContainerTimeline());
  document.body.classList.add('is-initialized');
 }

export {};
