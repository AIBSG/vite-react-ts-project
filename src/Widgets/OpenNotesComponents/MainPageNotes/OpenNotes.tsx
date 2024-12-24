import { useQuery } from '@tanstack/react-query';
import MainPageNote from "../../../Entities/MainPageNote/MainPageNote";
import "./OpenNotes.css";
import PlaceholderNotePageImage from "../../../Shared/UI/PlaceholderNotePageImage/PlaceholderNotePageImage";

interface Author {
  email: string;
  password: string;
  activatedEmail: boolean;
  registryCode: number;
  gAcoount: boolean;
  id: string;
}

interface Note {
  description: string;
  title: string;
  author: Author;
  noteTags: string[];
}

interface OpenNotesTagProps {
  selectedTag: string;
}

const fetchNotes = async (selectedTag: string): Promise<Note[]> => {
  const url =
    selectedTag === "Все"
      ? "http://localhost:5182/api/Note/GetOpenNotes"
      : `http://localhost:5182/api/Note/OpenNotesByTags?tagNames=${selectedTag}`;

  const response = await fetch(url);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
};

function OpenNotes({ selectedTag }: OpenNotesTagProps) {
  const {
    data = [],
    error,
    isLoading,
  } = useQuery<Note[], Error>({
    queryKey: ['notes', selectedTag],
    queryFn: () => fetchNotes(selectedTag),
  });

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (error instanceof Error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="main__page-notes">
      <div className="open__notes-title__inner">
        <h3 className="open__notes-title">Открытые заметки</h3>
      </div>
      <p className="open__notes-description">
        Заметки, созданные другими пользователями
      </p>
      <div className="main__page-notes__list">
        {data.length > 0 ? (
          data.map((item, index) => (
            <MainPageNote key={index} {...item} />
          ))
        ) : (
          <PlaceholderNotePageImage />
        )}
      </div>
    </div>
  );
}

export default OpenNotes;
