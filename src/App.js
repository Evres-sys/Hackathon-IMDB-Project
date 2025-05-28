import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { useState } from 'react';

function App() {
  const [search, setSearch] = useState('');
  const [show, setShow] = useState(null);
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setError('');
    try {
      //Streaming Availability API
      const res1 = await fetch(
        `https://streaming-availability.p.rapidapi.com/shows/${encodeURIComponent(search)}?series_granularity=episode&output_language=en`,
      {
        headers: {
          'x-rapidapi-host': 'streaming-availability.p.rapidapi.com',
          'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY,
        },
      }
    );
    const data1 = await res1.json();
    console.log('Streaming API Data:', data1);
    if (!data1 || !data1.title) {
      setError('Show not found. Please enter a vaild IMDB ID.');
      setShow(null);
      setImage('');
      setLoading(false);
      return;
    }
    //Image Search API
    const titleForImageSearch = data1.title || data1.originalTitle || search;
    const res2 = await fetch(
      `https://real-time-image-search.p.rapidapi.com/search?query=TVShow,${encodeURIComponent(titleForImageSearch)}&limit=10&size=any&color=any&type=any&time=any&usage_rights=any&file_type=any&aspect_ratio=any&safe_search=off&region=us`,
      {
        headers: {
          'x-rapidapi-host': 'real-time-image-search.p.rapidapi.com',
          'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY,
        }
      }
    );
    const data2 = await res2.json();
    console.log('Image API Data:', data2.data);
    const imageUrl = data2?.data?.[0]?.thumbnail_url || data2?.data?.[0]?.url || '';


    setShow(data1);
    setImage(imageUrl);

    } catch (err) {
      console.error(err);
      setError('Failed to fetch show or image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id='page-wrapper'>
      <h1 style={{ textAlign: 'center'}}>Streaming Show Search</h1>
      <div style={{border: '1px solid black', padding:'0px'}}></div>
      <div className='container mt-4 text-center'>
        <div className='row justify-content-center'>
          <div className='col-md-4'>
            <div className='card shadow-lg text-white'>
              <div className='card-header bg-primary'>
                <h4>Use a show's IMDB ID to find where it's streaming!</h4>
              </div>
              <div className='card-body bg-dark'>
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                  <input type='text' value={search} onChange={(e) => setSearch(e.target.value)} placeholder='IMDB ID' />
                  <button type='submit' className='btn btn-primary'>Search</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {loading && <p className='text-center'>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {show && (
        <div className='container mt-5'>
          <div className='row justify-content-center'>
            <div className='col-md-4'>
              <h3>{show.title || 'No title Found'}</h3>
              {image ? (
                <img src={image} alt='Related visual' style={{maxWidth: '300px'}} />
              ) : (
                <p>No image available</p>
              )}
            </div>
            <div className='col-md-5'>
              <div className='card shadow-lg text-white'>
                <div className='card-header bg-success'>
                  <p>Available in US on:</p>
                </div>
                <div className='card-body bg-dark'>
                  <ul>
                    {show.streamingOptions?.us?.length > 0 ? (
                      show.streamingOptions.us.map((option, idx) => (
                        <li key={idx}>
                          <a href={option.link} target='_blank' rel='noopener noreferrer'>
                            {option.service?.name || 'Unknown Service'}
                          </a> - {option.type} ({option.quality})
                        </li>
                      ))
                    ) : (
                      <li>No US streaming options found</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
