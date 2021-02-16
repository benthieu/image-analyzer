export class ImageObject {
    private img: HTMLImageElement;

    constructor(path: string) {
        this.img = new Image();
        this.img.src = path;
    }

    loadListener(callback: (img: HTMLImageElement) => any): void {
        return this.img.addEventListener('load', () => {
            callback(this.img)
        }, false);
    }
}