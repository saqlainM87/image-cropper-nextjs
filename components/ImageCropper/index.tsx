import { ReactElement, useCallback, useEffect, useState } from 'react';
import { Cropper } from 'react-cropper';
import {
    Button,
    Col,
    message,
    Modal,
    Row,
    Slider,
    Upload,
    UploadProps,
} from 'antd';
import {
    InboxOutlined,
    RotateRightOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';

import 'cropperjs/dist/cropper.css';

import { CropModes, ImageCropperProps } from './ImageCropper.types';
import styles from './ImageCropper.module.scss';

export const ImageCropperModal = ({
    onFileSelect,
    mode = CropModes.AVATAR,
    anchorElement,
    uploadHandler,
    ...props
}: ImageCropperProps): ReactElement => {
    const [open, setOpen] = useState(false);
    const [image, setImage] = useState('');
    const [cropperInstance, setCropperInstance] = useState<Cropper>();

    const showModal = () => {
        setOpen(true);
    };

    const hideModal = () => {
        setOpen(false);

        // Clear the file state
        if (onFileSelect) {
            onFileSelect();
        } else {
            handleChange();
        }
    };

    const calculateAndSetRatio = useCallback(
        (mode: CropModes) => {
            switch (mode) {
                case CropModes.FREE_RATIO:
                    cropperInstance?.setAspectRatio(0);
                    break;

                case CropModes['16/9']:
                    cropperInstance?.setAspectRatio(1.78);
                    break;

                case CropModes['4/3']:
                    cropperInstance?.setAspectRatio(1.33);
                    break;

                case CropModes.AVATAR:
                    cropperInstance?.setAspectRatio(1);
                    break;

                default:
                    break;
            }
        },
        [cropperInstance]
    );

    useEffect(() => {
        calculateAndSetRatio(mode);
    }, [mode, calculateAndSetRatio]);

    const handleChange = (file?: RcFile) => {
        if (!file) {
            return setImage('');
        }

        const reader = new FileReader();

        reader.onload = () => {
            setImage(reader.result as any);
        };

        reader.readAsDataURL(file);
    };

    const draggerProps: UploadProps = {
        name: 'image',
        multiple: false,
        // action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
        onChange(info) {
            if (onFileSelect) {
                onFileSelect(info.file.originFileObj);
            } else {
                handleChange(info.file.originFileObj);
            }

            const { status } = info.file;

            if (status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (status === 'done') {
                message.success(
                    `${info.file.name} file uploaded successfully.`
                );
            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        // onDrop(e) {
        //     console.log('Dropped files', e.dataTransfer.files);
        // },
        accept: 'image/*',
        showUploadList: false,
    };

    const handleOk = () => {
        if (typeof cropperInstance !== 'undefined') {
            const croppedCanvas = cropperInstance.getCroppedCanvas({
                maxWidth: 4096,
                maxHeight: 4096,
                fillColor: '#fff',
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });

            croppedCanvas?.toBlob(
                (blob) => {
                    uploadHandler?.(blob);
                },
                'image/jpeg',
                1
            );
        }
    };

    const { Dragger } = Upload;
    const currentImage = props.src || image;

    return (
        <div
            className={`mb-8 flex flex-col justify-end items-center ${styles.imageCropperWrapper}`}
        >
            {/* <input
                name="image"
                className="w-1/3 my-4"
                type="file"
                onChange={onChange}
                accept="image/*"
            /> */}

            <div className="my-4">
                {anchorElement ? (
                    <span onClick={showModal}>{anchorElement}</span>
                ) : (
                    <Button onClick={showModal} icon={<UploadOutlined />}>
                        Upload picture
                    </Button>
                )}
            </div>

            <Modal
                title="Upload your profile picture"
                open={open}
                // onOk={hideModal}
                onCancel={hideModal}
                okButtonProps={{ hidden: !currentImage }}
                cancelButtonProps={{ hidden: true }}
                okText="Upload image"
                onOk={handleOk}
            >
                {currentImage ? (
                    <Row justify="center" gutter={[0, 12]}>
                        <Col xs={24} className={styles.cropperWrapper}>
                            <Cropper
                                className={`cropperContainer ${
                                    mode === CropModes.AVATAR
                                        ? styles.cropperAvatar
                                        : ''
                                }`}
                                {...props}
                                src={currentImage}
                                onInitialized={(instance) => {
                                    setCropperInstance(instance); // For internal use
                                    props.onInitialized?.(instance); // For external use
                                }}
                            />
                        </Col>
                        <Col xs={18}>
                            <Row align="middle" gutter={[12, 0]}>
                                <Col xs={20}>
                                    <Slider
                                        className={styles.zoomSlider}
                                        step={0.1}
                                        max={1}
                                        defaultValue={0.4}
                                        onChange={(value) => {
                                            cropperInstance?.zoomTo(value);
                                        }}
                                    />
                                </Col>

                                <Col>
                                    <Button
                                        onClick={() => {
                                            cropperInstance?.rotate(90);
                                        }}
                                        type="text"
                                        icon={
                                            <span className={styles.rotateIcon}>
                                                <RotateRightOutlined />
                                            </span>
                                        }
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                ) : (
                    <Dragger {...draggerProps}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">
                            Select Image file to upload
                        </p>
                        <p className="ant-upload-hint">
                            Maximum file size is 5 MB. Recommended resolution is
                            600x600px.
                        </p>
                    </Dragger>
                )}
            </Modal>
        </div>
    );
};
