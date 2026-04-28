import React, { useState, useEffect, useCallback } from 'react';
import { fetchClient } from '../api/fetchClient';
import { Library, Plus, Search, Book as BookIcon, User as UserIcon, Tag, Hash, Trash2, Edit3, CheckCircle2 } from 'lucide-react';

const Bookshelf = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    category: 'Self-Dev',
    total_pages: '',
  });

  const fetchBooks = useCallback(async () => {
    try {
      const res = await fetchClient('/books/');
      if (res) setBooks(res);
    } catch (e) {
      console.error('Failed to fetch books', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchClient('/books/', {
        method: 'POST',
        body: JSON.stringify({
          ...newBook,
          total_pages: parseInt(newBook.total_pages) || 0
        }),
      });
      if (res) {
        setBooks([res, ...books]);
        setShowAddModal(false);
        setNewBook({ title: '', author: '', category: 'Self-Dev', total_pages: '' });
      }
    } catch (e) {
      console.error('Failed to add book', e);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to remove this book from your shelf?')) return;
    try {
      await fetchClient(`/books/${id}/`, { method: 'DELETE' });
      setBooks(books.filter(b => b.id !== id));
    } catch (e) {
      console.error('Failed to delete book', e);
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-serif text-text-primary mb-1">Your Bookshelf</h1>
          <p className="text-text-muted text-sm italic">"A room without books is like a body without a soul."</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search library..." 
              className="bg-surface/50 border border-surface-border rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-text-primary text-white p-2.5 rounded-full hover:bg-primary transition-all shadow-md active:scale-95"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <div key={book.id} className="surface-card group hover:-translate-y-2 transition-all duration-300 flex flex-col h-full bg-surface/80 border-b-4 border-b-primary/20">
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                    book.category === 'Career' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {book.category}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDeleteBook(book.id)} className="p-1.5 text-text-muted hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-serif text-text-primary mb-1 line-clamp-2 leading-tight">
                  {book.title}
                </h3>
                <p className="text-sm text-text-muted mb-4 flex items-center gap-1.5 font-medium italic">
                  <UserIcon size={13} />
                  {book.author}
                </p>

                {/* Progress Bar */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter text-text-muted">
                    <span>Progress</span>
                    <span>{book.total_pages > 0 ? Math.round((book.current_page / book.total_pages) * 100) : 0}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-border/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000" 
                      style={{ width: `${book.total_pages > 0 ? Math.min((book.current_page / book.total_pages) * 100, 100) : 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-text-muted font-mono">
                    <span className="flex items-center gap-1"><Hash size={10} /> {book.current_page}</span>
                    <span>/ {book.total_pages} pages</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-surface-border/30 bg-surface-hover/30 flex justify-between items-center">
                <span className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${
                  book.status === 'Reading' ? 'text-primary' : book.status === 'Completed' ? 'text-green-600' : 'text-text-muted'
                }`}>
                  {book.status === 'Reading' && <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />}
                  {book.status === 'Completed' && <CheckCircle2 size={12} />}
                  {book.status}
                </span>
                <button className="text-[10px] font-bold uppercase tracking-widest text-text-primary hover:text-primary transition-colors flex items-center gap-1">
                  <Edit3 size={12} />
                  Update
                </button>
              </div>
            </div>
          ))}
          
          {/* Add Placeholder */}
          <button 
            onClick={() => setShowAddModal(true)}
            className="surface-card border-dashed border-2 bg-transparent flex flex-col items-center justify-center p-8 hover:bg-surface/30 transition-all group min-h-[250px]"
          >
            <div className="w-12 h-12 rounded-full bg-surface-border/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="text-text-muted" />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-text-muted">Add New Book</p>
          </button>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-surface-border">
              <h2 className="text-xl font-serif text-text-primary">Add to Library</h2>
              <p className="text-xs text-text-muted uppercase tracking-widest mt-1">Acquire a new title</p>
            </div>
            <form onSubmit={handleAddBook} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Book Title</label>
                <input 
                  type="text" 
                  className="input-field py-2 text-sm" 
                  placeholder="e.g. Meditations"
                  value={newBook.title}
                  onChange={e => setNewBook({...newBook, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Author</label>
                <input 
                  type="text" 
                  className="input-field py-2 text-sm" 
                  placeholder="Marcus Aurelius"
                  value={newBook.author}
                  onChange={e => setNewBook({...newBook, author: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Category</label>
                  <select 
                    className="input-field py-2 text-sm bg-white"
                    value={newBook.category}
                    onChange={e => setNewBook({...newBook, category: e.target.value})}
                  >
                    <option value="Career">Career</option>
                    <option value="Self-Dev">Self-Dev</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Total Pages</label>
                  <input 
                    type="number" 
                    className="input-field py-2 text-sm" 
                    placeholder="250"
                    value={newBook.total_pages}
                    onChange={e => setNewBook({...newBook, total_pages: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 text-xs font-bold uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-text-primary text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all shadow-md"
                >
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookshelf;
