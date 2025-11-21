'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ActivityTagSelectorProps {
    selectedTags: string[];
    onChange: (tags: string[]) => void;
}

const PREDEFINED_ACTIVITIES = [
    'Travel', 'Hiking', 'Beach', 'Dinner', 'Lunch', 'Brunch',
    'Party', 'Concert', 'Movie', 'Date Night', 'Family', 'Friends',
    'Birthday', 'Anniversary', 'Wedding', 'Road Trip', 'Camping',
    'Sports', 'Gym', 'Relaxing', 'Work', 'Study', 'Shopping'
];

export default function ActivityTagSelector({ selectedTags = [], onChange }: ActivityTagSelectorProps) {
    const [customTag, setCustomTag] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            onChange(selectedTags.filter(t => t !== tag));
        } else {
            onChange([...selectedTags, tag]);
        }
    };

    const handleAddCustomTag = (e: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();
        const trimmedTag = customTag.trim();
        if (trimmedTag && !selectedTags.includes(trimmedTag)) {
            onChange([...selectedTags, trimmedTag]);
            setCustomTag('');
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                    Activity Tags
                </label>
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-pink-500 hover:text-pink-600 font-medium"
                >
                    {isExpanded ? 'Show Less' : 'Show All Activities'}
                </button>
            </div>

            {/* Selected Tags Display */}
            <div className="flex flex-wrap gap-2 min-h-[32px]">
                {selectedTags.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No tags selected</p>
                )}
                {selectedTags.map(tag => (
                    <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-700"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className="ml-1.5 text-pink-500 hover:text-pink-800 focus:outline-none"
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>

            {/* Tag Selection Area */}
            <div className={`bg-gray-50 rounded-xl p-4 transition-all duration-300 ${isExpanded ? 'block' : 'hidden'}`}>
                <div className="mb-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={customTag}
                            onChange={(e) => setCustomTag(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddCustomTag(e);
                                }
                            }}
                            placeholder="Add custom tag..."
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400"
                        />
                        <button
                            type="button"
                            onClick={handleAddCustomTag}
                            disabled={!customTag.trim()}
                            className="px-3 py-1.5 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {PREDEFINED_ACTIVITIES.map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedTags.includes(tag)
                                ? 'bg-pink-500 text-white shadow-sm'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-500'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {!isExpanded && (
                <div className="flex flex-wrap gap-2">
                    {PREDEFINED_ACTIVITIES.slice(0, 8).map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedTags.includes(tag)
                                ? 'bg-pink-500 text-white shadow-sm'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-500'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setIsExpanded(true)}
                        className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-500 hover:bg-gray-200"
                    >
                        + More
                    </button>
                </div>
            )}
        </div>
    );
}
