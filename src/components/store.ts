"use client";
import { proxy } from 'valtio';

const state = proxy({
  intro: true,
  colors: ['#ccc', '#EFBD4E', '#80C670', '#726DE8', '#EF674E', '#353934'],
  decals: [ 'r','s'], // Add the existing decals here
  selectedColor: '#EFBD4E',
  selectedDecal: 's', // Set the default selected decal

  // Add a new property to store local image URLs
  localDecals: [],
});

export { state };
