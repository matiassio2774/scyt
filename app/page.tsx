'use client';
import { SearchIcon } from "@/components/icons";
import { Fragment, useState } from 'react';
import { Input } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";
import { Button } from "@nextui-org/button";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faDownload } from "@fortawesome/free-solid-svg-icons";
config.autoAddCss = false;

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    const response = await fetch(`/api/download?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      console.error("Error downloading file");
      setLoading(false);
      return;
    }

    const disposition = response.headers.get('Content-Disposition');
    let filename = 'audio.mp3';

    if (disposition && disposition.includes('filename=')) {
      const matches = disposition.match(/filename="([^"]+)"/);
      if (matches && matches[1]) {
        filename = matches[1];
      }
    }

    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setLoading(false);
  };

  const handleEnterKey = (e: any) => {
    if (e.key === 'Enter') {
      handleDownload();
    }
  };

  return (
    <div className="downloader-container">
      <h1 className="title">Download .mp3 from YouTube</h1>
      <p className="subtitle">Paste a link to convert and download songs in high quality MP3 format</p>
      <div className="bar d-flex">
        {loading ? (
          <Spinner color="primary" labelColor="primary" />
        ) : (
          <Fragment>
          <Input
            value={url}
            classNames={{
              inputWrapper: "bg-default-100",
            }}
            labelPlacement="outside"
            placeholder="Introduce el enlace de YouTube"
            startContent={
              <SearchIcon className="flex-shrink-0 text-base pointer-events-none text-default-400" />
            }
            type="text"
            onChange={(e) => setUrl(e.target.value)}
            style={{ padding: '8px', marginRight: '10px' }}
            onKeyDown={handleEnterKey}
          />
          <Button onClick={() => handleDownload()} isIconOnly color="success" aria-label="Like">
            <FontAwesomeIcon icon={faDownload} className="fa fa-download" style={{ color: "white" }}
            ></FontAwesomeIcon>
          </Button> 
          </Fragment>
        )}
      </div>
    </div>
  );
}
