import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SomeTourViewPage = () => {
  useEffect(() => {
    const fetchTour = async () => {
      try {
        // Tur ID'sini almak
        const tourId = someIdFromRouteOrProps;
        console.log("Fetching tour with ID:", tourId);
        
        const { data: tourData, error: tourError } = await supabase
          .from('tours')
          .select('*')
          .eq('id', tourId)
          .single();
        
        if (tourError) {
          console.error("Error fetching tour:", tourError);
          return;
        }
        
        console.log("Tour data fetched:", tourData);
        
        // Medya öğelerini çek
        const { data: mediaData, error: mediaError } = await supabase
          .from('tour_media')
          .select('*')
          .eq('tour_id', tourId);
        
        if (mediaError) {
          console.error("Error fetching tour media:", mediaError);
        } else {
          console.log("Media data fetched:", mediaData);
          
          // Medya URL'lerini oluştur
          const mediaWithUrls = mediaData?.map(media => ({
            ...media,
            url: getMediaUrl(media.file_path)
          }));
          
          console.log("Media with URLs:", mediaWithUrls);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };
    
    fetchTour();
  }, [/* dependencies */]);

  return (
    // Rest of the component code
  );
};

export default SomeTourViewPage; 