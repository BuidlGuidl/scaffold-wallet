
import React from "react";
import { View } from "react-native";
import { WebView } from 'react-native-webview';

const PunkBlockie = (props) => {
    const { punkSize } = props;
    const smallSize = punkSize / 4
    const address = props.address
    let part1 = address && address.substr(2, 20);
    let part2 = address && address.substr(22);
    const x = parseInt(part1, 16) % 100;
    const y = parseInt(part2, 16) % 100;
    console.log('renderPunk');
    return (
        <View style={{ width: smallSize, height: smallSize }}>
            {/* PUNK IS BLURRY DUE TO ANTI-ALIASING, CSS IMAGE RENDERING "PIXELATED" NOT AVAILABLE ON REACT NATIVE */}
            {/* <Image source={punks} 
            style={{
                left: -iconPunkSize * x,
                top: -iconPunkSize * y,
                width: iconPunkSize * 100,
                height: iconPunkSize * 100,
                imageRendering: "pixelated",
              }}
            /> */}
            {/* EXTREMELY HACKY SOLUTION, LOAD IMAGE IN A WEBVIEW */}
            <WebView
                style={{ width: smallSize, height: smallSize }}
                scrollEnabled={false}
                // originWhitelist={['*']}
                source={{
                    html: `
                <div style="position: absolute; width: ${punkSize}; height: ${punkSize}; overflow: hidden;">
                <img src="https://www.larvalabs.com/public/images/cryptopunks/punks.png" 
                style="position: absolute; image-rendering: pixelated; height: ${punkSize * 100}; width: ${punkSize * 100}; left:${-punkSize * x}; top:${-punkSize * y - 1}"/>
                </div>
                ` }}
            />
        </View>
    )
}
export default React.memo(PunkBlockie)