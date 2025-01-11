import { useQuery } from '@tanstack/react-query';
import MainPageFile from "../../../Entities/MainPageFile/MainPageFile";
import "./OpenFiles.css";
import PlaceholderFilePageImage from "../../../Shared/UI/PlaceholderFilePageImage/PlaceholderFilePageImage";

interface Author {
  email: string;
  password: string;
  activatedEmail: boolean;
  registryCode: number;
  gAcoount: boolean;
  id: string;
}

interface IFile {
  description: string;
  title: string;
  documentNoteTags: {
    documentNoteId: string;
    tag: {
      name: string;
    };
  }[];
  author: Author;
}

interface OpenNotesTagProps {
  selectedTag: string;
}

const fetchFiles = async (selectedTag: string): Promise<IFile[]> => {
  const url =
    selectedTag === "Все"
      ? "https://student-artifact-exchange-service.onrender.com/api/Document/GetAllOpenDocuments"
      : `https://student-artifact-exchange-service.onrender.com/api/Document/OpenDocumentsByTags?tagNames=${selectedTag}`;

  const response = await fetch(url);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
};

function OpenFiles({ selectedTag }: OpenNotesTagProps) {
  const {
    data = [],
    error,
    isLoading,
  } = useQuery<IFile[], Error>({
    queryKey: ['files', selectedTag],
    queryFn: () => fetchFiles(selectedTag),
  });

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (error instanceof Error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="main__page-files">
      <div className="open__files-title__inner">
        <h3 className="open__files-title">Файлы</h3>
      </div>
      <div className="main__page-files__list">
      {data.length > 0 ? (
          data.map((item, index) => (
            <MainPageFile key={index} {...item} />
          ))
        ) : (
          <PlaceholderFilePageImage />
        )}
      </div>
    </div>
  );
}

export default OpenFiles;
