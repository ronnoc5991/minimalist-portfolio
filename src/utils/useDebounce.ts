export function useDebounce(callback: () => void, delay: number) {
  let timeoutId = null;


  // when we start resizing, flip the boolean
// start a timeout that will call the callback after the debounce amount
// in that callback, flip the boolean to true?
// no, instead, save a reference to the timeout id
// if that id exists, replace it
// after the timeout is called, set the timeoout id to none
}
