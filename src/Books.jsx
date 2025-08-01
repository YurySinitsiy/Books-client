import React, { useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import InfiniteScroll from 'react-infinite-scroll-component';
import "bootstrap/dist/css/bootstrap.min.css";

const fetchBooks = async ({ pageParam = 0, queryKey }) => {
  const [_, { seed, region, avgLikes, avgReviews }] = queryKey;
  try {
    const response = await fetch('http://localhost:3001/api/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        seed,
        page: pageParam,
        region,
        avgLikes,
        avgReviews,
      }),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Books loading Error:', error);
    throw error;
  }
};

const BookGenerator = () => {
  const [region, setRegion] = useState(null);
  const [seed, setSeed] = useState(12345);
  const [avgLikes, setAvgLikes] = useState(5);
  const [avgReviews, setAvgReviews] = useState(2.5);
  const [expandedBookId, setExpandedBookId] = useState(null);
  const [languageSelected, setLanguageSelected] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['books', { seed, region, avgLikes, avgReviews }],
    queryFn: fetchBooks,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: languageSelected
  });

  const allBooks = data?.pages.flatMap(page => page.books) || [];

  const handleRandomSeed = useCallback(() => {
    setSeed(Math.floor(Math.random() * 100000));
  }, []);

  const toggleExpandBook = (bookId) => {
    setExpandedBookId(expandedBookId === bookId ? null : bookId);
  };

  const handleLanguageSelect = (selectedRegion) => {
    setRegion(selectedRegion);
    setLanguageSelected(true);

  };

  if (!languageSelected) {
    return (
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <select
            value={region || ''}
            onChange={(e) => handleLanguageSelect(e.target.value)}
            className="form-select form-select-lg mb-3"
            style={{ width: '300px', margin: '0 auto' }}
          >
            <option value="" disabled>Select language</option>
            <option value="en">English (USA)</option>
            <option value="ja">日本語 (日本)</option>
            <option value="ru">Русский (Россия)</option>
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className='d-flex' style={{ width: "100vw" }}>
      <div className="container mx-auto p-1">
        <div className="mb-4">
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Select language:</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="form-select"
              >
                <option value="en">English (USA)</option>
                <option value="ru">Русский</option>
                <option value="ja">日本語 (日本)</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Seed</label>
              <div className="input-group">
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(Number(e.target.value))}
                  className="form-control"
                />
                <button
                  onClick={handleRandomSeed}
                  className="btn btn-outline-secondary"
                >
                  Random
                </button>
              </div>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Likes: {avgLikes}</label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={avgLikes}
                onChange={(e) => setAvgLikes(Number(e.target.value))}
                className="form-range"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Reviews</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={avgReviews}
                onChange={(e) => setAvgReviews(Number(e.target.value))}
                className="form-control"
              />
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <InfiniteScroll
            dataLength={allBooks.length}
            next={fetchNextPage}
            hasMore={hasNextPage && !isFetching}
            loader={<div className="text-center py-4">Loading more books...</div>}
          >
            <table className='table'>
              <thead className='table-light'>
                <tr>
                  <th>#</th>
                  <th>ISBN</th>
                  <th>Title</th>
                  <th>Author(s)</th>
                  <th>Publisher</th>
                </tr>
              </thead>
              <tbody>
                {allBooks.map((book) => (
                  <React.Fragment key={`${book.id}-${book.isbn}`}>
                    <tr
                      onClick={() => toggleExpandBook(book.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{book.id}</td>
                      <td>{book.isbn}</td>
                      <td>{book.title.charAt(0).toUpperCase() + book.title.slice(1)}</td>
                      <td>{book.authors.join(', ')}</td>
                      <td>{book.publisher}</td>
                    </tr>
                    {expandedBookId === book.id && (
                      <tr onClick={(() => console.log(book.id))}>
                        <td colSpan="7" className="p-4 table-secondary">
                          <div className="row gap-4">
                            <div className='col-md-3 d-flex flex-column gap-4'>
                              <div className='d-flex flex-column justify-content-between p-3'
                                style={{
                                  height: '400px',
                                  backgroundImage: `url(${book.cover})`,
                                  backgroundRepeat: 'no-repeat',
                                  backgroundSize: '320px 400px'

                                }}>
                                <h5 className="fs-5 text-wrap"
                                  style={{
                                    color: "white",
                                    textShadow: `1px 0 black,-1px 0 black, 0 1px black,0 -1px black`
                                  }}>{book.title}</h5>
                                <span className='fs-5 text-wrap' style={{
                                  color: "white",
                                  textShadow: `1px 0 black,-1px 0 black, 0 1px black,0 -1px black`
                                }}>{book.authors.join(', ')}
                                </span>
                              </div>
                              <span className='text-center fs-4 bg-primary text-light badge text-wrap'>
                                {book.likes} 👍
                              </span>
                            </div>
                            <div className="table-info col-md">
                              <h5>Description </h5>
                              <p className="mb-4">{book.description}</p>

                              <h5>Reviews ({book.reviews?.length || 0})</h5>
                              {book.reviews?.length > 0 ? (
                                <div className="reviews grid-cards gap-5">
                                  {book.reviews.map((review, index) => (
                                    <div key={index} className="mb-3 p-3 bg-white rounded card">
                                      <div className="d-flex justify-content-between mb-2">
                                        <strong className='card-title'>{review.author}</strong>
                                        <span className="text-warning card-text">
                                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                        </span>
                                      </div>
                                      <p className="mb-0">{review.text}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p>No reviews yet</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </InfiniteScroll>
        </div>
      </div >
    </div >
  );
};

export default BookGenerator;