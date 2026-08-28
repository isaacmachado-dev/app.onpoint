import { useState } from "react";
import LiquidFillGauge from "react-ts-liquid-gauge";

export default function PointComponent() {
    const [value, setValue] = useState(75);

    return (
        <>
            <div className="w-full flex flex-col items-center">
            <h1 className="text-3xl font-bold">14:00</h1>

            <div className="rounded-full flex flex-col items-center justify-center mx-auto my-3">
              <LiquidFillGauge
                width={130}
                height={130}
                value={value}
                unit="%"
                shapeType="circle"
                riseAnimation={true}
                waveAnimation={true}
                waveFrequency={2}
                waveAmplitude={3}
                gradient={true}
                shapeStyle={{
                  fill: "#25586A",
                }}
                waveStyle={{
                  fill: "#25586A",
                }}
                textStyle={{
                  fill: "#25586A",
                  fontFamily: "Arial",
                  fontWeight: "bold",
                }}
                waveTextStyle={{
                  fill: "#FFFFFF",
                  fontFamily: "Arial",
                  fontWeight: "bold",
                }}
                textRenderer={() => null}
              />
            </div>

            <div className="flex gap-4 bg-[#ACEBF0] mt-2 w-48 h-2 mx-auto justify-between px-2 items-center rounded-full">
              <span className="rounded-full h-2 w-2 bg-brand-main"></span>
              <span className="rounded-full h-2 w-2 bg-brand-main"></span>
              <span className="rounded-full h-2 w-2 bg-brand-main"></span>
              <span className="rounded-full h-2 w-2 bg-brand-main"></span>
            </div>

          </div>
        </>

    );
}