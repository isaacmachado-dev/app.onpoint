/// <reference types="vite/client" />

declare module "react-liquid-gauge" {
  import * as React from "react";

  export interface LiquidFillGaugeProps {
    width?: number;
    height?: number;
    value: number;
    percent?: string;
    textSize?: number;
    textOffsetX?: number;
    textOffsetY?: number;
    textRenderer?: (props: any) => React.ReactNode;
    riseAnimation?: boolean;
    riseAnimationTime?: number;
    waveAnimation?: boolean;
    waveAnimationTime?: number;
    waveFrequency?: number;
    waveAmplitude?: number;
    gradient?: boolean;
    gradientAnimation?: boolean;
    startColor?: string;
    endColor?: string;
    circleStyle?: React.CSSProperties;
    waveStyle?: React.CSSProperties;
    textStyle?: React.CSSProperties;
    waveTextStyle?: React.CSSProperties;
    onClick?: (event: React.MouseEvent) => void;
    innerRadius?: number;
    outerRadius?: number;
    margin?: number;
  }

  const LiquidFillGauge: React.ComponentType<LiquidFillGaugeProps>;
  export default LiquidFillGauge;
}
