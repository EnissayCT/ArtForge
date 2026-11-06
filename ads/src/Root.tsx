import React from "react";
import { Composition } from "remotion";
import { AdMurVide } from "./ads/AdMurVide";
import { AdTaPhoto } from "./ads/AdTaPhoto";
import { LoopGlint, LoopSnap } from "./loops/Loops";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="AdMurVide"
        component={AdMurVide}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={450}
        defaultProps={{ brand: "ArtForge", safe: false }}
      />
      <Composition
        id="AdTaPhoto"
        component={AdTaPhoto}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={450}
        defaultProps={{ brand: "ArtForge", photo: "scenes/cafe.jpg", photoPosition: "62% 50%", safe: false }}
      />
      {/* Silent product loops for the website, 4:5 */}
      <Composition id="SiteLoopGlint" component={LoopGlint} width={1080} height={1350} fps={30} durationInFrames={240} defaultProps={{ art: "art/zellige-fes.jpg" }} />
      <Composition id="SiteLoopSnap" component={LoopSnap} width={1080} height={1350} fps={30} durationInFrames={210} defaultProps={{ art: "art/zellige-chefchaouen.jpg" }} />
    </>
  );
};
