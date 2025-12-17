import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Section } from '../types';
import { GripVertical, Edit, Trash2 } from 'lucide-react';

interface SortableSectionProps {
  section: Section;
  icon: React.ReactNode;
  label: string;
  onEdit: () => void;
  onDelete: () => void;
}

export const SortableSection: React.FC<SortableSectionProps> = ({
  section,
  icon,
  label,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
    >
      <div className="flex items-center space-x-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical size={20} />
        </div>

        {/* Section Icon */}
        <div className="text-blue-600">{icon}</div>

        {/* Section Info */}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{section.title || label}</h4>
          <p className="text-sm text-gray-500">{label}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Edit section"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Delete section"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
