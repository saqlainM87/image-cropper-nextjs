import { ReactElement, useCallback, useEffect, useState } from 'react';
import { Cropper } from 'react-cropper';

import 'cropperjs/dist/cropper.css';

import { CropModes, ImageCropperProps } from './ImageCropper.types';
import styles from './ImageCropper.module.scss';

export const ImageCropper = ({
    onChange,
    image,
    instance,
    ...props
}: ImageCropperProps): ReactElement => {
    const [openModeSelector, setOpenModeSelector] = useState(false);
    const [selectedMode, setSelectedMode] = useState<CropModes>(
        CropModes.FREE_RATIO
    );

    const calculateAndSetRatio = useCallback(
        (mode: CropModes) => {
            switch (mode) {
                case CropModes.FREE_RATIO:
                    instance?.setAspectRatio(0);
                    break;

                case CropModes['16/9']:
                    instance?.setAspectRatio(1.78);
                    break;

                case CropModes['4/3']:
                    instance?.setAspectRatio(1.33);
                    break;

                case CropModes.AVATAR:
                    instance?.setAspectRatio(1);
                    break;

                default:
                    break;
            }
        },
        [instance]
    );

    useEffect(() => {
        calculateAndSetRatio(selectedMode);
    }, [selectedMode, calculateAndSetRatio]);

    const handleModeSelect = (mode: CropModes) => () => {
        setOpenModeSelector(false);
        setSelectedMode(mode);
    };

    return (
        <div
            className={`mb-8 flex flex-col justify-end items-center ${styles.imageCropperWrapper}`}
        >
            <input
                name="image"
                className="w-1/3 my-4"
                type="file"
                onChange={onChange}
                accept="image/*"
            />

            {image && (
                <div className="relative z-10 mb-4 self-end inline-block text-left mr-2">
                    <div>
                        <button
                            type="button"
                            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
                            id="menu-button"
                            aria-expanded="true"
                            aria-haspopup="true"
                            onClick={() =>
                                setOpenModeSelector((prevState) => !prevState)
                            }
                            onBlur={() => {
                                setTimeout(() => {
                                    setOpenModeSelector(false);
                                }, 200);
                            }}
                        >
                            Crop Mode
                            {/* Heroicon name: solid/chevron-down */}
                            <svg
                                className="-mr-1 ml-2 h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>

                    {openModeSelector && (
                        <div
                            className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby="menu-button"
                            tabIndex={-1}
                        >
                            <div className="py-1" role="none">
                                {/* Active: "bg-gray-100 text-gray-900", Not Active: "text-gray-700" */}
                                <button
                                    className={`text-gray-700 block w-full text-left px-4 py-2 text-sm ${
                                        selectedMode === CropModes.FREE_RATIO
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-700'
                                    }`}
                                    role="menuitem"
                                    tabIndex={-1}
                                    onClick={handleModeSelect(
                                        CropModes.FREE_RATIO
                                    )}
                                >
                                    Free Ratio
                                </button>
                                <button
                                    className={`text-gray-700 block w-full text-left px-4 py-2 text-sm ${
                                        selectedMode === CropModes['4/3']
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-700'
                                    }`}
                                    role="menuitem"
                                    tabIndex={-1}
                                    onClick={handleModeSelect(CropModes['4/3'])}
                                >
                                    4:3 Ratio
                                </button>
                                <button
                                    className={`text-gray-700 block w-full text-left px-4 py-2 text-sm ${
                                        selectedMode === CropModes['16/9']
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-700'
                                    }`}
                                    role="menuitem"
                                    tabIndex={-1}
                                    onClick={handleModeSelect(
                                        CropModes['16/9']
                                    )}
                                >
                                    16:9 Ratio
                                </button>
                                <button
                                    className={`text-gray-700 block w-full text-left px-4 py-2 text-sm ${
                                        selectedMode === CropModes.AVATAR
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-700'
                                    }`}
                                    role="menuitem"
                                    tabIndex={-1}
                                    onClick={handleModeSelect(CropModes.AVATAR)}
                                >
                                    Round Avatar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <Cropper
                className={`${
                    selectedMode === CropModes.AVATAR
                        ? styles.cropperAvatar
                        : ''
                }`}
                {...props}
            />
        </div>
    );
};
