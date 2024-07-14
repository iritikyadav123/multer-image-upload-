import { useEffect, useState } from "react";
import axios from 'axios';
import { Buffer } from 'buffer';

export default function App() {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get('http://localhost:3000/images');
        setImages(res.data);
        // console.log(res.data[0], 'hello');
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    }

    fetchData();
  }, []);

  async function handleSubmit() {
    const data = new FormData();
    data.append('image', file);

    try {
      const res = await axios.post('http://localhost:3000/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(res.data);
      // Refresh the list of images after upload
      const updatedRes = await axios.get('http://localhost:3000/images');
      setImages(updatedRes.data[0]);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }

  function imageFromBuffer(buffer) {
    if (!buffer) return '';
    // const base64String = btoa(String.fromCharCode(...new Uint8Array(buffer.data.data)));
    const base64String = Buffer.from(buffer.data.data).toString('base64');
    return `data:${buffer.type};base64,${base64String}`;
  }

  return (
    <div>
      <input
        type="file"
        onChange={(e) => { setFile(e.target.files[0]); }}
      />
      <button onClick={handleSubmit}>Submit</button>

      <img
        src={imageFromBuffer(images[0].img)}
        alt="Uploaded"
      />
      <div>

        {images.map((item) => (
          <img
            src={imageFromBuffer(item.img)}
            alt="Uploaded"
          />
        ))}

      </div>
    </div>
  );
}
