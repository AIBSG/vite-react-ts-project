import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import './SearchInput.css';

interface SearchInputProps {
  onTagChange: (tag: string) => void;
}

interface ITag {
  name: string;
}

async function fetchTags(): Promise<ITag[]> {
  const response = await fetch('https://student-artifact-exchange-service.onrender.com/api/Tag/GetAllTags');
  if (!response.ok) {
    throw new Error('Failed to fetch tags');
  }
  return response.json();
}

function SearchInput({ onTagChange }: SearchInputProps) {
  const [selectedTag, setSelectedTag] = useState("Все");

  const { data: tags = [], isLoading, isError } = useQuery({
    queryKey: ['tags'], 
    queryFn: fetchTags
  });

  const handleTagChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const tag = event.target.value;
    setSelectedTag(tag);
    onTagChange(tag);
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (isError) {
    return <div>Ошибка при загрузке тегов</div>;
  }

  return (
    <div>
      <form className='search__form'>
        <label className="search__title" htmlFor="search__tags">Сортировка по тегу:</label>
        <select
          className="search__tags-list"
          id="search__tags"
          name="search__tags"
          value={selectedTag}
          onChange={handleTagChange}
        >
          <option value="Все">Все</option>
          {tags.map((tag) => (
            <option key={tag.name} value={tag.name}>
              {tag.name}
            </option>
          ))}
        </select>
      </form>
    </div>
  );
}

export default SearchInput;
