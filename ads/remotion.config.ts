// Render settings shared by `remotion studio`, `remotion still` and `remotion render`.
// GPU safety: this machine had driver crashes, so Chrome uses software GL (SwANGLE)
// and only two tabs render in parallel. CLI flags passed by scripts/render-all.mjs repeat these.
import { Config } from "@remotion/cli/config";

Config.setEntryPoint("src/index.ts");
Config.setChromiumOpenGlRenderer("swangle");
Config.setConcurrency(2);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setCrf(18);
Config.setAudioBitrate("192k");
Config.setOverwriteOutput(true);
