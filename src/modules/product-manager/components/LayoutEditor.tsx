import React, { useState, useEffect } from 'react';
import { Section, SectionType, Product, Category, Brand } from '../types';
import {
  GripVertical,
  Plus,
  Trash2,
  Eye,
  Save,
  Image as ImageIcon,
  Grid,
  Layers,
  Package,
  Scroll,
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableSection } from './SortableSection';
import { SectionEditor } from './SectionEditor';

interface LayoutEditorProps {
  sections: Section[];
  products: Product[];
  categories: Category[];
  brands: Brand[];
  onSave: (sections: Section[]) => Promise<void>;
  onPreview: () => void;
}

export const LayoutEditor: React.FC<LayoutEditorProps> = ({
  sections: initialSections,
  products,
  categories,
  brands,
  onSave,
  onPreview,
}) => {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const reorderedSections = arrayMove(items, oldIndex, newIndex);

        // Update display order
        return reorderedSections.map((section, index) => ({
          ...section,
          displayOrder: index,
        }));
      });
    }
  };

  const handleAddSection = (type: SectionType) => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type,
      title: `New ${type}`,
      displayOrder: sections.length,
      config: {},
    };

    setSections([...sections, newSection]);
    setEditingSection(newSection);
    setIsAddingSection(false);
  };

  const handleUpdateSection = (updatedSection: Section) => {
    setSections(
      sections.map((s) => (s.id === updatedSection.id ? updatedSection : s))
    );
    setEditingSection(null);
  };

  const handleDeleteSection = (id: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      setSections(sections.filter((s) => s.id !== id).map((s, index) => ({
        ...s,
        displayOrder: index,
      })));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(sections);
    } finally {
      setIsSaving(false);
    }
  };

  const sectionTypeIcons: Record<SectionType, React.ReactNode> = {
    hero: <ImageIcon size={20} />,
    'two-column-grid': <Grid size={20} />,
    'brand-row': <Layers size={20} />,
    'bundle-block': <Package size={20} />,
    'scrolling-section': <Scroll size={20} />,
  };

  const sectionTypeLabels: Record<SectionType, string> = {
    hero: 'Hero Section',
    'two-column-grid': 'Two-Column Grid',
    'brand-row': 'Brand Row',
    'bundle-block': 'Bundle Block',
    'scrolling-section': 'Scrolling Section',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Layout Editor</h2>
          <p className="text-sm text-gray-500 mt-1">
            Drag sections to reorder, click to edit
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onPreview}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <Eye size={20} />
            <span>Preview</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <Save size={20} />
            <span>{isSaving ? 'Saving...' : 'Save Layout'}</span>
          </button>
        </div>
      </div>

      {/* Add Section Button */}
      {!isAddingSection && (
        <button
          onClick={() => setIsAddingSection(true)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
        >
          <Plus size={20} />
          <span className="font-medium">Add Section</span>
        </button>
      )}

      {/* Section Type Selector */}
      {isAddingSection && (
        <div className="bg-blue-50 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Choose Section Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {(Object.keys(sectionTypeIcons) as SectionType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleAddSection(type)}
                className="flex flex-col items-center space-y-2 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition"
              >
                <div className="text-blue-600">{sectionTypeIcons[type]}</div>
                <span className="text-sm font-medium text-gray-700">
                  {sectionTypeLabels[type]}
                </span>
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddingSection(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sections List with Drag & Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {sections.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                icon={sectionTypeIcons[section.type]}
                label={sectionTypeLabels[section.type]}
                onEdit={() => setEditingSection(section)}
                onDelete={() => handleDeleteSection(section.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {sections.length === 0 && !isAddingSection && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Layers className="mx-auto text-gray-300" size={64} />
          <p className="text-gray-500 mt-4 font-medium">No sections yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Click "Add Section" to get started
          </p>
        </div>
      )}

      {/* Section Editor Modal */}
      {editingSection && (
        <SectionEditor
          section={editingSection}
          products={products}
          categories={categories}
          brands={brands}
          onSave={handleUpdateSection}
          onCancel={() => setEditingSection(null)}
        />
      )}
    </div>
  );
};
