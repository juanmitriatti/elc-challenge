
import { useCSVReader } from 'react-papaparse';
import React, { CSSProperties, useState } from 'react';
import { Map } from "../map/map";

const styles = {
  csvReader: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
    width: '300ps',
  } as CSSProperties,
  browseFile: {
    width: '20%',
  } as CSSProperties,
  acceptedFile: {
    border: '1px solid #ccc',
    height: 45,
    lineHeight: 2.5,
    paddingLeft: 10,
    width: '80%',
  } as CSSProperties,
  remove: {
    borderRadius: 0,
    padding: '0 20px',
  } as CSSProperties,
  progressBarBackgroundColor: {
    backgroundColor: 'red',
  } as CSSProperties,
};

export  function CSVReader() {
  const { CSVReader } = useCSVReader();
  const [markers, setMarkers] = useState(null);

  return (
    <>
    <CSVReader
      onUploadAccepted={(results: any) => {
        const data = results.data;                
        const cleanedData = data.slice(1);
        // Extracting elements 13 and 14 from each inner array
        const extractedData = cleanedData.filter(row => row[2] && row[2].toUpperCase() === 'TRUCK').map(row => [row[14], row[15]]);
        // Remove the first row
        setMarkers(extractedData);
      }}
    >
      {({
        getRootProps,
        acceptedFile,
        ProgressBar,
        getRemoveFileProps,
      }: any) => (
        <>
          <div style={styles.csvReader}>
            <button type='button' {...getRootProps()} style={styles.browseFile}>
              Browse file
            </button>
            <div style={styles.acceptedFile}>
              {acceptedFile && acceptedFile.name}
            </div>
            <button {...getRemoveFileProps()} style={styles.remove}>
              Remove
            </button>
          </div>
          <ProgressBar style={styles.progressBarBackgroundColor} />
        </>
      )}
    </CSVReader>
     {markers && <div style={{ width: "100%", height: "100vh" }}>
       <Map markers={markers}/>
      </div> }
    </>
  );
}
