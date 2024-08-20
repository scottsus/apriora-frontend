import lamejs from "@breezystack/lamejs";

const AUDIO_SAMPLE_SIZE = 16;
const MAX_INT16_VALUE = Math.pow(2, AUDIO_SAMPLE_SIZE - 1) - 1;

/**
 * Takes an audio/webm file and converts it to mp3 in the browser.
 * @param file audio/webm
 * @returns mp3
 */
export function webmToMp3(file: File): Promise<File> {
  return new Promise((res, rej) => {
    const audioContext = new AudioContext();
    const fileReader = new FileReader();

    fileReader.onload = async function (event) {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const channels = audioBuffer.numberOfChannels;
        const samples = audioBuffer.getChannelData(0);

        const mp3Encoder = new lamejs.Mp3Encoder(
          channels,
          audioBuffer.sampleRate,
          128,
        );

        const mp3Data = [];
        const sampleBlockSize = 1152;

        for (let i = 0; i < samples.length; i += sampleBlockSize) {
          const sampleChunk = samples.subarray(i, i + sampleBlockSize);
          const int16Chunk = new Int16Array(
            sampleChunk.map((s) => s * MAX_INT16_VALUE),
          );
          const mp3buf = mp3Encoder.encodeBuffer(int16Chunk);
          if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
          }
        }
        const mp3buf = mp3Encoder.flush();
        if (mp3buf.length > 0) {
          mp3Data.push(mp3buf);
        }

        const mp3Blob = new Blob(mp3Data, { type: "audio/mp3" });
        const mp3File = new File([mp3Blob], "audio.mp3", { type: "audio/mp3" });

        res(mp3File);
      } catch (err) {
        rej(err);
      }
    };

    fileReader.onerror = () => rej(new Error("Error reading file."));

    fileReader.readAsArrayBuffer(file);
  });
}
