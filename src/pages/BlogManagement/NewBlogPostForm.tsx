import React, { useState, useEffect } from 'react';
import { X, Image, Clock, Calendar, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ContentImage {
  path: string;
  alt: string;
}

interface BlogTag {
  name: string;
  slug: string;
}

interface ContentSection {
  type: 'paragraph' | 'heading';
  content: string;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category_name: string;
  category_slug: string;
  hero_image: string;
  content_images: ContentImage[];
  published_at: string;
  read_time: number;
  author_name: string;
  author_title: string;
  author_image: string;
  tags: BlogTag[];
  content_sections: ContentSection[];
  is_published: boolean;
  is_featured: boolean;
}

interface NewBlogPostFormProps {
  post?: BlogPost | null;
  onClose: () => void;
  onSuccess: () => void;
}

const NewBlogPostForm: React.FC<NewBlogPostFormProps> = ({ post, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    category_name: post?.category_name || '',
    category_slug: post?.category_slug || '',
    hero_image: post?.hero_image || '',
    content_images: post?.content_images || [],
    published_at: post?.published_at || new Date().toISOString(),
    read_time: post?.read_time || 5,
    author_name: post?.author_name || '',
    author_title: post?.author_title || '',
    author_image: post?.author_image || '',
    tags: post?.tags || [],
    content_sections: post?.content_sections || [],
    is_published: post?.is_published || false,
    is_featured: post?.is_featured || false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState({ name: '', slug: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const timestamp = Date.now();
      const uniqueSlug = post?.id 
        ? formData.slug
        : `${formData.slug || generateSlug(formData.title)}-${timestamp}`;

      const dataToSave = {
        ...formData,
        slug: uniqueSlug,
        updated_at: new Date().toISOString(),
        created_at: post?.id ? undefined : new Date().toISOString()
      };

      if (post?.id) {
        dataToSave.id = post.id;
      }

      const { error } = await supabase
        .from('blog_posts')
        .upsert(dataToSave, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Save error:', error);
        throw error;
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Blog yazısı kaydedilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'hero' | 'content' | 'author') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      let bucketName = '';
      switch (type) {
        case 'hero':
          bucketName = 'blog-post-images';
          break;
        case 'content':
          bucketName = 'blog-content-images';
          break;
        case 'author':
          bucketName = 'blog-author-images';
          break;
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Dosya boyutu 5MB\'dan büyük olamaz');
      }

      try {
        const { error: uploadError, data } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('Upload error details:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        const storagePath = fileName;
        
        if (type === 'hero') {
          setFormData(prev => ({ ...prev, hero_image: `${bucketName}/${storagePath}` }));
        } else if (type === 'author') {
          setFormData(prev => ({ ...prev, author_image: `${bucketName}/${storagePath}` }));
        } else {
          setFormData(prev => ({
            ...prev,
            content_images: [...prev.content_images, { 
              path: `${bucketName}/${storagePath}`, 
              alt: file.name 
            }]
          }));
        }

        console.log('Upload successful:', {
          type,
          bucketName,
          fileName: storagePath,
          fullPath: `${bucketName}/${storagePath}`,
          publicUrl
        });

        return publicUrl;
      } catch (uploadError) {
        console.error('Storage error:', uploadError);
        throw new Error(`Görsel yüklenemedi: ${uploadError.message || 'Bilinmeyen hata'}`);
      }
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      alert(error instanceof Error ? error.message : 'Görsel yüklenirken bir hata oluştu');
      throw error;
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-4/5 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center pb-3">
          <h3 className="text-xl font-semibold">
            {post ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ana Bilgiler */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Başlık</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    title: e.target.value,
                    slug: generateSlug(e.target.value)
                  }));
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">URL</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
          </div>

          {/* Kategori ve Meta Bilgiler */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Kategori</label>
              <input
                type="text"
                value={formData.category_name}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    category_name: e.target.value,
                    category_slug: generateSlug(e.target.value)
                  }));
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Okuma Süresi (dk)</label>
              <input
                type="number"
                value={formData.read_time}
                onChange={(e) => setFormData(prev => ({ ...prev, read_time: parseInt(e.target.value) }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Yayın Tarihi</label>
              <input
                type="datetime-local"
                value={formData.published_at.slice(0, 16)}
                onChange={(e) => setFormData(prev => ({ ...prev, published_at: new Date(e.target.value).toISOString() }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
          </div>

          {/* Yazar Bilgileri */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Yazar Adı</label>
              <input
                type="text"
                value={formData.author_name}
                onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Yazar Ünvanı</label>
              <input
                type="text"
                value={formData.author_title}
                onChange={(e) => setFormData(prev => ({ ...prev, author_title: e.target.value }))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Yazar Görseli</label>
              <div className="mt-1 flex items-center space-x-2">
                {formData.author_image && (
                  <div className="relative">
                    <img
                      src={supabase.storage.from(formData.author_image.split('/')[0]).getPublicUrl(formData.author_image.split('/')[1]).data.publicUrl}
                      alt="Yazar"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, author_image: '' }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'author');
                  }}
                  className="mt-1 block w-full"
                />
              </div>
            </div>
          </div>

          {/* Görseller */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hero Görsel</label>
              <div className="mt-1 flex items-center space-x-2">
                {formData.hero_image && (
                  <div className="relative">
                    <img
                      src={supabase.storage.from(formData.hero_image.split('/')[0]).getPublicUrl(formData.hero_image.split('/')[1]).data.publicUrl}
                      alt="Hero"
                      className="h-20 w-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, hero_image: '' }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'hero');
                  }}
                  className="mt-1 block w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">İçerik Görselleri</label>
              <div className="mt-2 grid grid-cols-4 gap-4">
                {formData.content_images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={supabase.storage.from(image.path.split('/')[0]).getPublicUrl(image.path.split('/')[1]).data.publicUrl}
                      alt={image.alt}
                      className="h-24 w-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          content_images: prev.content_images.filter((_, i) => i !== index)
                        }));
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(file => handleImageUpload(file, 'content'));
                }}
                className="mt-2 block w-full"
              />
            </div>
          </div>

          {/* Etiketler */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Etiketler</label>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        tags: prev.tags.filter((_, i) => i !== index)
                      }));
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag.name}
                onChange={(e) => setNewTag({ name: e.target.value, slug: generateSlug(e.target.value) })}
                placeholder="Yeni etiket..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
              <button
                type="button"
                onClick={() => {
                  if (newTag.name) {
                    setFormData(prev => ({
                      ...prev,
                      tags: [...prev.tags, newTag]
                    }));
                    setNewTag({ name: '', slug: '' });
                  }
                }}
                className="mt-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Ekle
              </button>
            </div>
          </div>

          {/* İçerik */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">İçerik</label>
            <textarea
              value={formData.content_sections[0]?.content || ''}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  content_sections: [{ type: 'paragraph', content: e.target.value }]
                }));
              }}
              rows={10}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          {/* Durum Kontrolleri */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-600">Yayınla</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-600">Öne Çıkar</span>
            </label>
          </div>

          {/* Form Butonları */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Kaydediliyor...' : post ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBlogPostForm;