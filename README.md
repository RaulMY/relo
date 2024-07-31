# Image Annotation Analyzer

This is a React project that provides a user interface to annotate images given a list of categories.

## Prerequisites

This project uses yarn. If you don't have yarn installed, you will have to first run:

```
npm install --global yarn

```

Which assumes you have npm as well, which comes with [Node](http://nodejs.org/).

The project was created using vite.

## Installing

```
$ git clone https://github.com/RaulMY/relo.git
```

Then move down to the new folder that was just created

```
$ cd relo
```

Once you are in that folder, you can run the following command:
```
$ yarn install
```

## Running the project

To start the project, simply run this command in your terminal, and then go to [localhost:5173](http://localhost:5173/) on your browser:

```
$ yarn dev
```

## File Structure

This is a relatively small project, so the file structure is pretty straight forward.

```
src
└── App.tsx
└── main.tsx
└── components
    └── CategoryForm.tsx
    └── ImageCanvas.tsx
    └── ImageQueue.tsx
└── utils
    └── API.tsx
```

Inside our source (src) folder you can find some of the usual files for a React application, such as App.tsx, and main.tsx.

You will also find the components folder, where, as the name suggests, the React components created for this project are stored. 

There are three components for this project:
- CategoryForm: A component that handles the search and selection of a category
- ImageCanvas: A component wrapped around a canvas that handles displaying the image, as well as annotating it.
- ImageQueue: A simple UI component with no internal logic that displays the list of the next 10 images in the queue.

## Styling

This project uses Tailwind out of the box to style its components.

## State Management

Given that this project has a very shallow component tree no external library for state management was deemed necessary. If the project were to grow, this could be reconsidered.
