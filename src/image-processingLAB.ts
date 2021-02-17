
export class ImageProcessingLAB {
    private allPixels = Array<PixelData>();
    private clusters = Array<Array<PixelData>>();
    private tolerance = 3.5;

    constructor(private context: CanvasRenderingContext2D) {
        this.prepareData();
    }

    public getClusters(): Array<Array<PixelData>> {
        return this.clusters;
    }

    public getAllPixels(): Array<PixelData> {
        return this.allPixels;
    }

    private prepareData(): void {
        let latestClusterNumber = 0;
        const width = this.context.canvas.width;
        for (let y = 0; y < this.context.canvas.height; y++) {
            for (let x = 0; x < this.context.canvas.width; x++) {
                const data = this.context.getImageData(x, y, 1, 1).data;
                const pixel = {
                    labData: this.rgbToLab(data[0], data[1], data[2]),
                    rgbData: {
                        r: data[0],
                        g: data[1],
                        b: data[2]
                    },
                    x: x,
                    y: y
                } as PixelData;

                const topleftPixel = this.allPixels[width * (y - 1) + (x - 1)];
                if (topleftPixel && this.isInSameCluster(topleftPixel, pixel)) {
                    pixel.cluster = topleftPixel.cluster;
                } else {
                    const leftPixel = this.allPixels[width * y + (x - 1)];
                    if (leftPixel && this.isInSameCluster(leftPixel, pixel)) {
                        pixel.cluster = leftPixel.cluster;
                    } else {
                        const topPixel = this.allPixels[width * (y - 1) + x];
                        if (topPixel && this.isInSameCluster(topPixel, pixel)) {
                            pixel.cluster = topPixel.cluster;
                        } else {
                            pixel.cluster = latestClusterNumber;
                            this.clusters[latestClusterNumber] = new Array<PixelData>();
                            latestClusterNumber = latestClusterNumber + 1;
                        }
                    }
                }
                this.clusters[pixel.cluster].push(pixel);
                this.allPixels.push(pixel);
            }
        }
    }

    private isInSameCluster(pixelA: PixelData, pixelB: PixelData): boolean {
        const delta = this.deltaE(pixelA.labData, pixelB.labData);
        return delta < this.tolerance;
    }

    // code from: https://github.com/antimatter15/rgb-lab/blob/master/color.js
    private rgbToLab(r1: number, g1: number, b1: number): labData {
        let r = r1 / 255,
            g = g1 / 255,
            b = b1 / 255,
            x, y, z;

        r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

        x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
        y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
        z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

        x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116;
        y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;
        z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116;

        return {
            l: (116 * y) - 16,
            a: 500 * (x - y),
            b: 200 * (y - z)
        } as labData
    }

    // calculate the perceptual distance between colors in CIELAB
    // https://github.com/THEjoezack/ColorMine/blob/master/ColorMine/ColorSpaces/Comparisons/Cie94Comparison.cs

    private deltaE(labA: labData, labB: labData): number {
        let deltaL = labA.l - labB.l;
        let deltaA = labA.a - labB.a;
        let deltaB = labA.b - labB.b;
        let c1 = Math.sqrt(labA.a * labA.a + labA.b * labA.b);
        let c2 = Math.sqrt(labB.a * labB.a + labB.b * labB.b);
        let deltaC = c1 - c2;
        let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
        deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
        let sc = 1.0 + 0.045 * c1;
        let sh = 1.0 + 0.015 * c1;
        let deltaLKlsl = deltaL / (1.0);
        let deltaCkcsc = deltaC / (sc);
        let deltaHkhsh = deltaH / (sh);
        let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
        return i < 0 ? 0 : Math.sqrt(i);
    }
}

export class PixelData {
    labData?: labData;
    rgbData?: RgbData;
    x: number;
    y: number;
    cluster?: number;
}

export class labData {
    l: number;
    a: number;
    b: number;
}

export class RgbData {
    r: number;
    g: number;
    b: number;
}