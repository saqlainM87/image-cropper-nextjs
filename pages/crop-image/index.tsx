import { useState } from 'react';
import { NextPage } from 'next';
import Cropper from 'react-cropper';
import Image from 'next/image';

import 'cropperjs/dist/cropper.css';

export const CropImage: NextPage = () => {
    const [image, setImage] = useState('');
    const [cropData, setCropData] = useState('');
    const [cropper, setCropper] = useState<Cropper>();
    const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

    const onChange = (e: any) => {
        e.preventDefault();

        let files;

        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setImage(reader.result as any);
        };

        reader.readAsDataURL(files[0]);
    };

    const getCropData = () => {
        if (typeof cropper !== 'undefined') {
            const croppedCanvas = cropper.getCroppedCanvas();

            croppedCanvas.toBlob((blob) => {
                setCroppedBlob(blob);
            });
            setCropData(croppedCanvas.toDataURL());
        }
    };

    const downloadCroppedImage = async (blob: Blob, name: string) => {
        try {
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: `${name}.png`,
            });
            const fileStream = await fileHandle.createWritable();

            await fileStream.write(blob);
            await fileStream.close();
        } catch (error) {}
    };

    const handleDownload = () => {
        if (croppedBlob) {
            downloadCroppedImage(croppedBlob, `cropped_image`);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="w-1/2 mb-8 flex flex-col items-center">
                <input className="w-1/3 my-4" type="file" onChange={onChange} />
                <Cropper
                    className="w-full"
                    zoomTo={0.5}
                    initialAspectRatio={1}
                    preview=".img-preview"
                    src={image}
                    viewMode={1}
                    minCropBoxHeight={10}
                    minCropBoxWidth={10}
                    background={false}
                    responsive={true}
                    autoCropArea={1}
                    checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                    onInitialized={(instance) => {
                        setCropper(instance);
                    }}
                    guides={true}
                />
            </div>
            <div className="w-1/2 flex justify-center mb-4">
                <div className="w-1/2 pr-2 flex flex-col items-center">
                    <h1 className="text-center">Preview</h1>

                    <div className="self-start flex justify-center overflow-hidden items-center w-full h-52 border-solid border-2 border-blue-600">
                        <div className="img-preview overflow-hidden w-52 h-52" />
                    </div>
                </div>
                <div className="pl-2 w-1/2 flex flex-col items-center">
                    <h1 className="text-center">
                        <span>Cropped</span>
                    </h1>
                    <div className="self-end flex justify-center items-center overflow-hidden w-full h-52 border-solid border-2 border-green-600">
                        {cropData && (
                            <Image
                                src={cropData}
                                className="object-contain"
                                width="208px" //w-52
                                height="208px" //h-52
                                alt="cropped"
                            />
                        )}
                    </div>
                </div>
            </div>
            <div className="flex justify-center mb-4">
                <button
                    className="bg-indigo-600 px-4 py-2 text-white rounded"
                    onClick={getCropData}
                >
                    Crop Image
                </button>

                <button
                    className="bg-blue-800 ml-4 px-4 py-2 text-white rounded"
                    onClick={handleDownload}
                >
                    Save
                </button>
            </div>
        </div>
    );
};

export default CropImage;
