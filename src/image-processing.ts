
export class ImageProcessing {
    private allPixels = Array<PixelData>();
    private clusters = Array<Array<PixelData>>();
    private hThreshold = 20;
    private sThreshold = 5;
    private lThreshold = 10;

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
                    hslData: this.rgbToHsl(data[0], data[1], data[2]),
                    rgbData: {
                        r: data[0],
                        g: data[1],
                        b: data[2]
                    },
                    x: x,
                    y: y
                } as PixelData;
                const leftPixel = this.allPixels[width * y + (x - 1)];
                if (leftPixel && this.isInSameCluster(leftPixel, pixel)) {
                    pixel.cluster = leftPixel.cluster;
                } else {
                    const topPixel = this.allPixels[width * (y - 1) + x];
                    if (topPixel && this.isInSameCluster(topPixel, pixel)) {
                        pixel.cluster = topPixel.cluster;
                    } else {
                        const topleftPixel = this.allPixels[width * (y - 1) + (x - 1)];
                        if (topleftPixel && this.isInSameCluster(topleftPixel, pixel)) {
                            pixel.cluster = topleftPixel.cluster;
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

    private unifyClusters(): void {
        for (let cluster of this.clusters) {
            const middlePixel = Math.floor(cluster.length/2);
        }
    }

    private isInSameCluster(pixelA: PixelData, pixelB: PixelData): boolean {
        return this.hasCloseHValue(pixelA.hslData.h, pixelB.hslData.h) &&
            this.hasCloseSValue(pixelA.hslData.s, pixelB.hslData.s) &&
            this.hasCloseLValue(pixelA.hslData.l, pixelB.hslData.l)
    }

    private hasCloseHValue(hValueA: number, hValueB: number): boolean {
        const rangeStart = hValueA - this.hThreshold;
        const rangeEnd = hValueA + this.hThreshold;
        if (hValueB >= rangeStart && hValueB <= rangeEnd) {
            return true;
        }
        if (rangeStart < 0 && hValueB >= (100 + rangeStart)) {
            return true;
        }
        if (rangeEnd > 100 && hValueB <= (rangeEnd - 100)) {
            return true;
        }
    }

    private hasCloseSValue(sValueA: number, sValueB: number): boolean {
        const rangeStart = sValueA - this.sThreshold;
        const rangeEnd = sValueA + this.sThreshold;
        if (sValueB >= rangeStart && sValueB <= rangeEnd) {
            return true;
        }

    }

    private hasCloseLValue(lValueA: number, lValueB: number): boolean {
        const rangeStart = lValueA - this.lThreshold;
        const rangeEnd = lValueA + this.lThreshold;
        if (lValueB >= rangeStart && lValueB <= rangeEnd) {
            return true;
        }
    }

    private rgbToHsl(r: number, g: number, b: number): any {
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return {
            h: h * 100,
            s: s * 100,
            l: l * 100
        } as HslData;
    }
}

class PixelData {
    hslData?: HslData;
    rgbData?: RgbData;
    x: number;
    y: number;
    cluster?: number;
}

class HslData {
    h: number;
    s: number;
    l: number;
}

class RgbData {
    r: number;
    g: number;
    b: number;
}