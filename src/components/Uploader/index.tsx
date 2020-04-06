import * as React from 'react'
import { FC, useState, useEffect, useRef} from 'react'

import './styles.scss';
interface UploadProps {
    url?: string,
    onChange?: (url: string) => void
}
const Uploader: FC<UploadProps> = ({url, onChange}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    // regular | hover | uploading | uploaded
    const [uploadState, setUploadState] = useState('regular');

    const [dragging, setDragging] = useState(false);
    const [logoImage, setLogoImage] = useState<string>();
    const [file, setFile] = useState<File>();

    const overrideEventDefaults = (event: Event | React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    }

    useEffect(() => {
        window.addEventListener("dragover", (event: Event) => {
            overrideEventDefaults(event);
        });
        window.addEventListener("drop", (event: Event) => {
            overrideEventDefaults(event);
        });
    }, [])

    useEffect(() => {
        return () => {
            window.removeEventListener("dragover", overrideEventDefaults);
            window.removeEventListener("drop", overrideEventDefaults);
        }
    }, []);

    useEffect(() => {
        if (url)
            setLogoImage(`url(${url})`);
    }, [url])



    const dragenterListener = (event: React.DragEvent<HTMLDivElement>) => {
        overrideEventDefaults(event);
        if (event.dataTransfer.items && event.dataTransfer.items[0]) {
            setUploadState('hover');
        }
    }

    const dragleaveListener = (event: React.DragEvent<HTMLDivElement>) => {
        overrideEventDefaults(event);
        setUploadState('regular');
    }

    const loadFile = (logoFile: File, cb) => {
        let reader = new FileReader();
        const type = logoFile.type;
        reader.readAsBinaryString(logoFile);

        reader.onload = () => {
            const base64logo = btoa(reader.result)
            setLogoImage(`url(data:${type};base64,${base64logo})`);
            cb();
        };

    }

    const dropListener = (event: React.DragEvent<HTMLDivElement>) => {
        overrideEventDefaults(event);
        setUploadState('uploading');
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            setFile(event.dataTransfer.files[0])
            loadFile(event.dataTransfer.files[0], () => {
                setUploadState('uploaded');
                onChange && onChange();
            })
        }
    }

    const onFilesAdded = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUploadState('uploading');
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0])
            loadFile(event.target.files[0], () => {
                setUploadState('uploaded');
                onChange && onChange();
            })
        }
    }

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if(fileInputRef && fileInputRef.current) {
            fileInputRef.current.click();
        }
    }


    return (
        <div className="uploader">
            <div className="uploader-header">
                <div className="uploader-header__title-1">Company Logo</div>
                <div className="uploader-header__title-2">Logo should be square, 100px size and in png, jpeg file format.</div>
            </div>
            <div className="uploader-content">
                <div
                    className={`uploader-content__drop-area${uploadState === 'hover' ? ' uploader-content__drop-area--hover' : ''}`}
                    onDragOver={overrideEventDefaults}

                    onDragEnter={dragenterListener}
                    onDragLeave={dragleaveListener}
                    onDrop={dropListener}
                >
                    <div className="uploader-content__logo" style={{backgroundImage: logoImage}}></div>
                    <div className="uploader-content__description">
                        {uploadState === 'regular' && 'Drag & drop here'}
                        {uploadState === 'hover' && 'Drag & drop here'}
                        {uploadState === 'uploading' && 'Uploading'}
                        {uploadState === 'uploaded' && 'Drag & drop here to replace'}
                    </div>
                    <div className="uploader-content__description-2">- or -</div>
                    {['regular', 'hover'].includes(uploadState) && (
                        <div className="uploader-content__description-3" onClick={handleClick}>
                            Select file to upload
                        </div>
                    )}
                    {uploadState === 'uploading' && (
                        <div className="uploader-content__description-3" onClick={handleClick}>
                            Cancel
                        </div>
                    )}
                    {uploadState === 'uploaded' && (
                        <div className="uploader-content__description-3" onClick={handleClick}>
                            Select file to replace
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        className="uploader-content__fileinput"
                        type="file"
                        onChange={onFilesAdded}
                    />
                </div>
            </div>
        </div>
    );
}

export default Uploader;