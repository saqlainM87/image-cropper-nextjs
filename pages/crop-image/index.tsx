import { useState } from 'react';
import { NextPage } from 'next';
import Image from 'next/image';

import { contentfulInstance } from '../../libs/contentful';
import { ImageCropperModal } from '../../components/ImageCropper';
import { RcFile } from 'antd/lib/upload';
import axios from 'axios';

export const CropImage: NextPage = () => {
    const [image, setImage] = useState('');
    const [cropData, setCropData] = useState('');
    const [cropper, setCropper] = useState<Cropper>();
    const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
    const [fileName, setFileName] = useState('');

    const onChange = (file?: RcFile) => {
        try {
            if (!file) {
                setImage('');
                return;
            }

            const reader = new FileReader();

            reader.onload = () => {
                setImage(reader.result as any);
            };

            reader.readAsDataURL(file);
        } catch (error) {}
    };

    const getCropData = () => {
        setFileName(`cropped_image_${new Date().toISOString()}`);

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
            downloadCroppedImage(croppedBlob, fileName);
        }
    };

    const upload = async () => {
        if (croppedBlob) {
            try {
                const uploadedAsset = await contentfulInstance.uploadFile(
                    croppedBlob,
                    fileName
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
        <div className="container mx-auto py-8 flex justify-center">
            <div className="bg-orange-100 w-3/4 flex flex-col items-center rounded">
                <ImageCropperModal
                    zoomTo={0.4}
                    dragMode="move"
                    preview=".img-preview"
                    // src={image}
                    viewMode={1}
                    minCropBoxHeight={10}
                    minCropBoxWidth={10}
                    background={false}
                    responsive={true}
                    autoCropArea={0.7}
                    checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                    // onInitialized={(instance) => {
                    //     setCropper(instance);
                    // }}
                    guides={false}
                    minContainerHeight={200}
                    minContainerWidth={200}
                    // onFileSelect={onChange}
                    // instance={cropper}
                    // anchorElement={
                    //     <button>
                    //         <input
                    //             name="image"
                    //             className="w-1/3 my-4"
                    //             type="file"
                    //             accept="image/*"
                    //             hidden
                    //         />
                    //         Upload
                    //     </button>
                    // }
                    uploadHandler={async (file) => {
                        console.log(file);

                        if (!file) {
                            return;
                        }

                        const formData = new FormData();

                        formData.append('file', file, 'file');

                        try {
                            return await axios.post(
                                '/api/file-upload',
                                formData,
                                {
                                    onUploadProgress: (progressEvent) => {
                                        const percentCompleted = Math.round(
                                            (progressEvent.loaded * 100) /
                                                progressEvent.total
                                        );

                                        console.log(percentCompleted);
                                    },
                                }
                            );
                        } catch (error) {}
                    }}
                />

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
