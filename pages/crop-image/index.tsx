import { useState } from 'react';
import { NextPage } from 'next';
import Cropper from 'react-cropper';
import Image from 'next/image';

import 'cropperjs/dist/cropper.css';

import { contentfulInstance } from '../../libs/contentful';

export const CropImage: NextPage = () => {
    const [image, setImage] = useState('');
    const [cropData, setCropData] = useState('');
    const [cropper, setCropper] = useState<Cropper>();
    const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

    const onChange = (e: any) => {
        e.preventDefault();

        try {
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
        } catch (error) {}
    };

    const getCropData = () => {
        if (typeof cropper !== 'undefined') {
            const croppedCanvas = cropper.getCroppedCanvas({
                maxWidth: 4096,
                maxHeight: 4096,
                fillColor: '#fff',
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });

            croppedCanvas.toBlob(
                (blob) => {
                    setCroppedBlob(blob);
                },
                'image/jpeg',
                1
            );
            setCropData(croppedCanvas.toDataURL('image/jpeg', 1));
        }
    };

    const downloadCroppedImage = async (blob: Blob, name: string) => {
        try {
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: `${name}.jpeg`,
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

    const upload = async () => {
        if (croppedBlob) {
            try {
                const uploadedAsset = await contentfulInstance.uploadFile(
                    croppedBlob
                );

                if (uploadedAsset) {
                    alert('Cropped image successfully uploaded.');
                }
            } catch (error) {
                alert('Error uploading the image ' + error);
            }
        }
    };

    const handleUpload = () => {
        upload();
    };

    return (
        <div className="container mx-auto h-screen flex justify-center items-center">
            <div className="bg-orange-100 w-3/4 flex flex-col items-center rounded">
                <div className="w-4/5 mt-48 mb-8 flex flex-col items-center">
                    <input
                        name="image"
                        className="w-1/3 my-4"
                        type="file"
                        onChange={onChange}
                        accept="image/*"
                    />
                    <Cropper
                        className="px-4"
                        zoomTo={0.25}
                        dragMode="move"
                        initialAspectRatio={1.78}
                        aspectRatio={1.78}
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
                        minContainerHeight={400}
                        minContainerWidth={400}
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
                        className={`px-4 py-2 text-white rounded ${
                            image ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                        onClick={getCropData}
                        disabled={!image}
                    >
                        Crop Image
                    </button>

                    <button
                        className={`ml-4 px-4 py-2 text-white rounded ${
                            cropData ? 'bg-blue-800' : 'bg-gray-300'
                        }`}
                        onClick={handleDownload}
                        disabled={!cropData}
                    >
                        Save
                    </button>

                    <button
                        className={`ml-4 px-4 py-2 text-white rounded ${
                            cropData ? 'bg-green-800' : 'bg-gray-300'
                        }`}
                        onClick={handleUpload}
                        disabled={!cropData}
                    >
                        Upload
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CropImage;
