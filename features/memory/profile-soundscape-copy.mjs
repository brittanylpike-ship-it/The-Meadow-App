export function getProfileSoundscapeCopy(audioOn) {
  return {
    label: "Soundscape",
    body: audioOn ? "Soft sound is allowed here." : "Quiet by default.",
  };
}
