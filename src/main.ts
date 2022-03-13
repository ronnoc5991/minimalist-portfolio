import gsap from 'gsap';
import { getRandomNumber } from './utils/getRandomNumber';
import { splitText } from './utils/splitText';
import type {Character} from "@/types/Character";

const scrollContainer = document.getElementById('scroll-container');
const text = document.getElementById('text');
const name = document.getElementById('name');
const role = document.getElementById('role');
const maskedContainer = document.getElementById('masked-container');
const maskStartPositionMarker = document.getElementById('mask-start-position-marker');
const linksContainer = document.getElementById('links-container');

let characters: Array<Character> = [];
let maskedContainerTimeline: gsap.core.Timeline;
let linksContainerTimeline: gsap.core.Timeline;

const getIntroductionScrollStartPosition = () => 0;
const getIntroductionScrollEndPosition = () => (name?.offsetWidth || 0) + (role?.offsetWidth || 0)
const getIntroductionScrollDurationInPixels = () => getIntroductionScrollEndPosition() - getIntroductionScrollStartPosition();

const getMaskOpenStartPosition = () => getIntroductionScrollEndPosition();
const getMaskOpenScrollDurationInPixels = () => window.innerHeight;
const getMaskOpenEndPosition = () => getMaskOpenStartPosition() + getMaskOpenScrollDurationInPixels();

const getLinksContainerTransitionStartPosition = () => getMaskOpenEndPosition() - (linksContainer?.offsetHeight ?? 0) * 4;
const getLinksContainerTransitionDurationInPixels = () => linksContainer?.offsetHeight ?? 0 * 4;
const getLinksContainerTransitionEndPosition = () => getLinksContainerTransitionStartPosition() + getLinksContainerTransitionDurationInPixels();

function getLinksContainerTimeline(linksContainer: HTMLElement): gsap.core.Timeline {
  const linksTimeline = gsap.timeline({ paused: true });
  const { children } = linksContainer;
  linksTimeline.from(linksContainer, { yPercent: 100, duration: 1 });
  linksTimeline.from(children, { yPercent: 50, duration: 0.5, stagger: 0.5 }, '<');
  return linksTimeline;
}

function updateLinksContainerTimeline(scrollDistance: number) {
  const progress = gsap.utils.normalize(getLinksContainerTransitionStartPosition(),  getLinksContainerTransitionEndPosition(), scrollDistance);
  gsap.set(linksContainerTimeline, { progress });
}

function getMaskedContentClipPath(position: 'beginning' | 'end') {
  if (!maskStartPositionMarker) return;
  const { top, left, width, height } = maskStartPositionMarker.getBoundingClientRect();
  const viewportMaximum = Math.max(window.innerWidth, window.innerHeight);
  const offset = position === 'end' ? viewportMaximum * 2 : 0;
  return `inset(${top - offset}px ${window.innerWidth - (left + width) - offset}px ${window.innerHeight - (top + height) - offset}px ${left - offset}px round ${viewportMaximum}px)`;
}

function getMaskedContainerTimeline(): gsap.core.Timeline {
  return gsap.timeline({ paused: true }).fromTo(maskedContainer, { clipPath: getMaskedContentClipPath('beginning') }, { clipPath: getMaskedContentClipPath('end'), duration: 1, ease: 'sine.in' });
}

function updateMaskedContainerTimelineProgress(scrollDistance: number) {
  const progress = gsap.utils.normalize(getMaskOpenStartPosition(),  getMaskOpenEndPosition(), scrollDistance);
  gsap.set(maskedContainerTimeline, { progress });
}

function setScrollContainerHeight() {
  if (!scrollContainer) return;
  scrollContainer.style.height = `${window.innerHeight + getIntroductionScrollDurationInPixels() + getMaskOpenScrollDurationInPixels()}px`;
}

function getCharacterTimeline(element: Element): gsap.core.Timeline {
  const timeline = gsap.timeline({ paused: true });
  timeline.from(element, { x: getRandomNumber(-window.innerWidth / 4, window.innerWidth / 4), y: getRandomNumber(-window.innerHeight / 4, window.innerHeight / 4), rotate: getRandomNumber(-45, 45), scale: getRandomNumber(0.5, 2.5), duration: 1, ease: 'back.inOut' });
  return timeline;
}

function updateCharacterTimelineProgress(character: Character, scrollDistance: number) {
  const characterTimelineProgress = gsap.utils.normalize(character.left, character.left + character.width, scrollDistance);
  gsap.to(character.timeline, { progress: characterTimelineProgress, duration: 1, ease: 'none' });
}

if (text) {
  const characterElements = [...text.children].map((child) => splitText(child as HTMLElement)).reduce((previous, current) => previous.concat(current));
  characterElements.forEach((characterElement) => {
    const { left, width } = characterElement.getBoundingClientRect();
    characters.push({
      element: characterElement,
      left,
      width,
      timeline: getCharacterTimeline(characterElement),
    });
  });
}

document.body.addEventListener('scroll', () => {
  const scrollDistance = document.body.scrollTop;
  characters.forEach((character) => updateCharacterTimelineProgress(character, scrollDistance))
  updateMaskedContainerTimelineProgress(scrollDistance);
  updateLinksContainerTimeline(scrollDistance);
})

let timeoutId: NodeJS.Timeout | null = null;

window.addEventListener('resize', () => {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    document.body.scrollTop = 0;
    setScrollContainerHeight();
    maskedContainerTimeline = getMaskedContainerTimeline();
    if (linksContainer) linksContainerTimeline = getLinksContainerTimeline(linksContainer);
    characters.forEach((character) => {
      const { left, width } = character.element.getBoundingClientRect();
      character.left = left;
      character.width = width;
      character.timeline.progress(0);
    });
    timeoutId = null;
  }, 300)
});

setScrollContainerHeight();

maskedContainerTimeline = getMaskedContainerTimeline();
if (linksContainer) linksContainerTimeline = getLinksContainerTimeline(linksContainer);

export {};
