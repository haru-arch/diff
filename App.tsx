import React, { useState, useCallback, ChangeEvent, FC } from 'react';

// --- SVG Icons --- //

const UploadIcon: FC<{ className?: string }> = ({ className }) => (
    <svg className={className} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
);

const DownloadIcon: FC<{ className?: string }> = ({ className }) => (
    <svg className={className} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

const ErrorIcon: FC<{ className?: string }> = ({ className }) => (
    <svg className={className} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

const SliderIcon: FC<{ className?: string }> = ({ className }) => (
     <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
);


// --- Helper Components --- //

interface ImageUploaderProps {
    id: string;
    label: string;
    imageUrl: string | null;
    onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
    disabled: boolean;
}

const ImageUploader: FC<ImageUploaderProps> = ({ id, label, imageUrl, onImageChange, disabled }) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center justify-center h-full">
        <h3 className="text-lg font-semibold mb-4 text-gray-300">{label}</h3>
        <div className="w-full h-64 bg-gray-900/50 rounded-md border-2 border-dashed border-gray-600 flex items-center justify-center relative overflow-hidden">
            <input
                type="file"
                id={id}
                accept="image/*"
                onChange={onImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={disabled}
            />
            <label htmlFor={id} className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-gray-500 hover:text-indigo-400 transition-colors">
                {imageUrl ? (
                    <img src={imageUrl} alt={label} className="max-w-full max-h-full object-contain" />
                ) : (
                    <>
                        <UploadIcon className="w-12 h-12 mb-2" />
                        <span>클릭하여 업로드</span>
                    </>
                )}
            </label>
        </div>
    </div>
);

interface ImageCompareSliderProps {
    image1: string;
    image2: string;
    dimensions: { width: number; height: number; } | null;
}

const ImageCompareSlider: FC<ImageCompareSliderProps> = ({ image1, image2, dimensions }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const aspectRatio = dimensions ? `${dimensions.width} / ${dimensions.height}` : '16 / 9';

    return (
        <div className="relative w-full max-w-full mx-auto select-none rounded-md overflow-hidden shadow-md" style={{ aspectRatio }}>
            {/* Base Image (Image 1) */}
            <div className="w-full h-full">
                <img src={image1} alt="원본" className="w-full h-full object-contain" />
            </div>
            {/* Top Image (Image 2), clipped */}
            <div className="absolute inset-0" style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}>
                <img src={image2} alt="수정" className="w-full h-full object-contain" />
            </div>

            {/* Slider line and handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white/70 cursor-ew-resize -translate-x-1/2 pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full shadow-lg backdrop-blur-sm flex items-center justify-center text-gray-800">
                     <SliderIcon className="w-6 h-6 transform rotate-90"/>
                </div>
            </div>

            <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                aria-label="Image comparison slider"
            />
        </div>
    );
};

// --- Main App Component --- //

function App() {
    const [image1, setImage1] = useState<string | null>(null);
    const [image2, setImage2] = useState<string | null>(null);
    const [diffImage, setDiffImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [tolerance, setTolerance] = useState<number>(5);
    const [diffCount, setDiffCount] = useState<number>(0);
    const [totalPixels, setTotalPixels] = useState<number>(0);
    const [dimensions, setDimensions] = useState<{width: number; height: number} | null>(null);


    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, side: 'image1' | 'image2') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);

            if (side === 'image1') {
                if (image1) URL.revokeObjectURL(image1);
                setImage1(url);
            } else {
                if (image2) URL.revokeObjectURL(image2);
                setImage2(url);
            }
            setDiffImage(null);
            setError(null);
            setDiffCount(0);
            setDimensions(null);
        }
    };

    const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
    });

    const handleCompare = useCallback(async () => {
        if (!image1 || !image2) {
            setError("비교하기 전에 두 이미지를 모두 업로드해주세요.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setDiffImage(null);
        setDiffCount(0);
        setTotalPixels(0);
        setDimensions(null);

        try {
            const [img1, img2] = await Promise.all([loadImage(image1), loadImage(image2)]);
            
            if (img1.width !== img2.width || img1.height !== img2.height) {
                throw new Error("비교하려면 이미지의 크기가 같아야 합니다.");
            }

            const { width, height } = img1;
            setTotalPixels(width * height);
            setDimensions({ width, height });

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("캔버스 컨텍스트를 가져올 수 없습니다.");
            
            ctx.drawImage(img1, 0, 0);
            const imageData1 = ctx.getImageData(0, 0, width, height);
            
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img2, 0, 0);
            const imageData2 = ctx.getImageData(0, 0, width, height);

            const resultImageData = ctx.createImageData(width, height);
            let differentPixels = 0;
            const threshold = (tolerance / 100) * (255 * 3);

            for (let i = 0; i < imageData1.data.length; i += 4) {
                const r1 = imageData1.data[i];
                const g1 = imageData1.data[i + 1];
                const b1 = imageData1.data[i + 2];
                const a1 = imageData1.data[i + 3];

                const r2 = imageData2.data[i];
                const g2 = imageData2.data[i + 1];
                const b2 = imageData2.data[i + 2];

                const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);

                if (diff > threshold) {
                    differentPixels++;
                    resultImageData.data[i] = 255;      // R
                    resultImageData.data[i + 1] = 0;    // G
                    resultImageData.data[i + 2] = 255;  // B (Magenta for visibility)
                    resultImageData.data[i + 3] = 255;  // A
                } else {
                    resultImageData.data[i] = r1;
                    resultImageData.data[i + 1] = g1;
                    resultImageData.data[i + 2] = b1;
                    resultImageData.data[i + 3] = a1 * 0.7; // Make same pixels slightly transparent
                }
            }

            ctx.putImageData(resultImageData, 0, 0);
            setDiffImage(canvas.toDataURL());
            setDiffCount(differentPixels);

        } catch (err: any) {
            setError(err.message || "비교 중 예기치 않은 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, [image1, image2, tolerance]);

    const handleDownload = () => {
        if (!diffImage) return;
        const link = document.createElement('a');
        link.href = diffImage;
        link.download = 'image-diff.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const canCompare = image1 !== null && image2 !== null;
    const aspectRatio = dimensions ? `${dimensions.width} / ${dimensions.height}` : '16 / 9';
    const matchPercentage = totalPixels > 0 ? ((totalPixels - diffCount) / totalPixels) * 100 : 100;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Pixel-Perfect Image Comparator
                    </h1>
                    <p className="mt-4 text-lg text-gray-400">
                        Upload two screenshots to visually compare them and highlight the differences.
                    </p>
                </header>

                <main>
                    <div className="bg-gray-800/50 p-6 rounded-xl shadow-2xl mb-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                             <div className="w-full md:w-1/3">
                                <label htmlFor="tolerance" className="block text-sm font-medium text-gray-300 mb-2">
                                    차이점 민감도 (허용치: {tolerance}%)
                                </label>
                                <input
                                    id="tolerance"
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={tolerance}
                                    onChange={(e) => setTolerance(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg"
                                    disabled={isLoading}
                                />
                                <p className="text-xs text-gray-500 mt-1">값이 낮을수록 변화에 더 민감합니다.</p>
                             </div>
                             <button
                                onClick={handleCompare}
                                disabled={!canCompare || isLoading}
                                className="w-full md:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        비교 중...
                                    </>
                                ) : "이미지 비교"}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ImageUploader id="image1" label="원본 이미지" imageUrl={image1} onImageChange={(e) => handleImageUpload(e, 'image1')} disabled={isLoading} />
                        <ImageUploader id="image2" label="수정된 이미지" imageUrl={image2} onImageChange={(e) => handleImageUpload(e, 'image2')} disabled={isLoading} />
                    </div>

                    {error && (
                        <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative flex items-center" role="alert">
                            <ErrorIcon className="w-6 h-6 mr-3"/>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    
                    {(diffImage || isLoading) && (
                        <div className="mt-8 bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                            <h3 className="text-xl font-semibold mb-4 text-gray-300 text-center">비교 결과</h3>

                            {!isLoading && diffImage && (
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center mb-6">
                                    {matchPercentage >= 100 ? (
                                        <p className="text-lg font-semibold text-green-400">완벽하게 일치합니다.</p>
                                    ) : (
                                        <p className="text-lg">
                                            일치율: <span className="font-bold text-cyan-400">{matchPercentage.toFixed(2)}%</span>
                                            <span className="ml-2 text-gray-400 italic">
                                            {
                                                matchPercentage >= 80 ? '차이점을 수정하세요.' :
                                                matchPercentage < 70 ? '일치하지 않는 부분이 많습니다. 재작업이 필요합니다.' :
                                                '상당한 차이점이 발견되었습니다.'
                                            }
                                            </span>
                                        </p>
                                    )}
                                    <button 
                                        onClick={handleDownload}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500"
                                    >
                                        <DownloadIcon className="w-5 h-5 mr-2" />
                                        결과 다운로드
                                    </button>
                                </div>
                            )}

                            <div className="w-full min-h-[16rem] bg-gray-900/50 rounded-md border-2 border-dashed border-gray-600 flex flex-col items-center justify-center relative overflow-hidden p-2 sm:p-4">
                                {isLoading ? (
                                    <div className="text-center text-gray-400">
                                        <svg className="animate-spin mx-auto h-10 w-10 text-indigo-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        픽셀 분석 중...
                                    </div>
                                ) : diffImage && image1 && image2 && (
                                    <div className="w-full flex flex-col items-center">
                                        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="flex flex-col items-center">
                                                <h4 className="text-md font-semibold mb-2 text-gray-300">차이점 마스크</h4>
                                                <div className="relative w-full max-w-full mx-auto rounded-md overflow-hidden shadow-md" style={{ aspectRatio }}>
                                                    <img src={diffImage} alt="차이점" className="w-full h-full object-contain" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <h4 className="text-md font-semibold mb-2 text-gray-300">좌우 슬라이더 비교</h4>
                                                <ImageCompareSlider image1={image1} image2={image2} dimensions={dimensions} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;
