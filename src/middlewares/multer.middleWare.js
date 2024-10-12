// import multer from "multer";

// const storage = multer.diskStorage({

//     destination:function(req,file,cb){
//         cb(null,"./public/temp")
//     },
//     filename: function(req,file,cb){
//         console.log(file);
        
//         cb(null,file.originalname)
//     }
// })


// export const upload = multer({storage:storage})


import multer from 'multer';
import path from 'path';

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp'); // Directory to store uploaded files
  },
  filename: function (req, file, cb) {
    // Log the file info
    console.log('File uploaded:', file);

    // Save the file with its original name
    cb(null, file.originalname);
  }
});

// Multer file filter to check file type if needed
const fileFilter = (req, file, cb) => {
  // Allow only certain file types (e.g., PNG, JPEG)
  const allowedMimeTypes = ['image/jpeg', 'image/png'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
  }
};

// Initialize multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Max file size: 5 MB
});
