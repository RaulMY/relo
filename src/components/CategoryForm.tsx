import { useState } from "react";
import type { Category } from "../utils/API";

interface CategoryFormProps {
  categories: Category[];
  onSubmit: (categoryId: number) => void;
  onDiscard: () => void;
  hasBoundingBox: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ categories, hasBoundingBox, onDiscard, onSubmit }) => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, selectCategory] = useState<Category | null>(null);
  
  return <div className="h-[700px] flex flex-col overflow-hidden"> 
    <div className="flex justify-around">
      <input
        type="text"
        placeholder="Search options..."
        className="border border-blue-500 p-2 rounded-sm"
        value={searchValue}
        onChange={({ target }) => setSearchValue(target.value)}
      />
      <button className="bg-orange-700 text-white" onClick={() => {
        onDiscard();
        setSearchValue("");
        selectCategory(null);
      }}>
        Discard
      </button>
      <button 
        disabled={!selectedCategory || !hasBoundingBox} 
        className="bg-green-400 text-white disabled:cursor-not-allowed  disabled:text-gray-500 disabled:bg-zinc-800"
        onClick={() => {
          if (selectedCategory) {
            onSubmit(selectedCategory.id);
            setSearchValue("")
            selectCategory(null);
          }
        }}
      >
        Confirm
      </button>
    </div>
    <div className="overflow-auto">
      {categories.filter(category => category.name.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())).map(category => {
        return (<div 
          key={`category-${category.id}`}
          className={`hover:bg-slate-500/40 cursor-pointer ${selectedCategory?.id === category.id ? 'bg-gray-800 text-white' : ''} `}
          onClick={() => selectCategory(category)}
        >
          {category.name}
        </div>)
      })}
    </div>
  </div>
};

export default CategoryForm;