//Credits to Google and StackOverflow

export const resizeAndCropImage = (file, width = 1200, height = 800) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            img.src = event.target.result;
        };

        img.onload = () => {
            const sourceWidth = img.width;
            const sourceHeight = img.height;

            const targetAspect = width / height;
            const sourceAspect = sourceWidth / sourceHeight;

            let cropWidth, cropHeight, cropX, cropY;

            if (sourceAspect > targetAspect) {
                // Source is wider than target: crop sides
                cropHeight = sourceHeight;
                cropWidth = cropHeight * targetAspect;
                cropX = (sourceWidth - cropWidth) / 2;
                cropY = 0;
            } else {
                // Source is taller than target: crop top/bottom
                cropWidth = sourceWidth;
                cropHeight = cropWidth / targetAspect;
                cropX = 0;
                cropY = (sourceHeight - cropHeight) / 2;
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(
                img,
                cropX, cropY, cropWidth, cropHeight,  // source crop
                0, 0, width, height                   // destination
            );

            canvas.toBlob((blob) => {
                if (blob) {
                    const newFile = new File([blob], file.name, { type: 'image/jpeg' });
                    resolve(newFile);
                } else {
                    reject(new Error("Canvas blob creation failed"));
                }
            }, 'image/jpeg', 1);  // 100% quality
        };

        img.onerror = reject;
    });
};
