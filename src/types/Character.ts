import gsap from "gsap";

export type Character = {
  element: Element;
  left: number;
  width: number;
  timeline: gsap.core.Timeline;
}
