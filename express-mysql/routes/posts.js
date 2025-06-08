// routes/posts.js
var express = require('express');
var router = express.Router();

// Import database connection (sesuaikan path ini jika berbeda)
var connection = require('../library/database');

/**
 * INDEX POSTS
 */
router.get('/', function (req, res, next) {
    // query untuk mengambil semua data dari tabel tbl_33_post, diurutkan berdasarkan id terbaru
    connection.query('SELECT * FROM tbl_33_post ORDER BY id DESC', function (err, rows) {
        if (err) {
            // Jika ada error dari database saat mengambil data
            req.flash('error', err.message || 'Gagal mengambil data posts.'); 
            // Render view 'posts/index' dengan data kosong dan pesan error
            return res.render('posts/index', { 
                data: [] 
            });
        } else {
            // Jika berhasil, render view 'posts/index' dengan data yang diambil
            return res.render('posts/index', { 
                data: rows // <-- data posts
            });
        }
    });
});

/**
 * CREATE POST - Menampilkan Form
 */
router.get('/create', function (req, res, next) {
    // Render view 'posts/create' untuk menampilkan form pembuatan post baru
    return res.render('posts/create', { 
        title: '', // Mengosongkan field title
        content: '' // Mengosongkan field content
    });
});

/**
 * STORE POST - Menyimpan Data Baru
 */
router.post('/store', function (req, res, next) {
    let title = req.body.title;
    let content = req.body.content;
    let validationErrors = []; // Array untuk menyimpan pesan error validasi

    // --- Validasi Input ---
    if (title.length === 0) {
        validationErrors.push("Silahkan Masukkan Title");
    }
    if (content.length === 0) {
        validationErrors.push("Silahkan Masukkan Konten");
    }

    // --- Jika Ada Error Validasi ---
    if (validationErrors.length > 0) {
        // Gabungkan semua pesan error menjadi satu string dan set sebagai flash message
        req.flash('error', validationErrors.join(', '));
        // Render kembali form 'posts/create' dengan data yang sudah diinput
        return res.render('posts/create', { 
            title: title, 
            content: content
        });
    }

    // --- Jika Tidak Ada Error (lanjut ke insert query) ---
    let formData = {
        title: title,
        content: content
    };

    // Insert query untuk menyimpan data baru ke tabel tbl_33_post
    connection.query('INSERT INTO tbl_33_post SET ?', formData, function (err, result) {
        if (err) {
            // Jika ada error dari database saat insert
            req.flash('error', err.message || 'Gagal menyimpan data ke database.'); 
            // Render kembali form 'posts/create' dengan data yang sudah diinput
            return res.render('posts/create', { 
                title: formData.title,
                content: formData.content
            });
        } else {
            // Jika berhasil, set flash message sukses dan redirect ke halaman daftar posts
            req.flash('success', 'Data Berhasil Disimpan!');
            return res.redirect('/posts'); 
        }
    });
});


/**
 * EDIT POST - Menampilkan Form Edit
 */
router.get('/edit/:id', function (req, res, next) {
    let id = req.params.id;

    // Query untuk mengambil data post berdasarkan ID
    // PENTING: Menggunakan placeholder '?' untuk mencegah SQL Injection
    connection.query('SELECT * FROM tbl_33_post WHERE id = ?', [id], function (err, rows, fields) {
        if (err) {
            // Jika ada error saat mengambil data
            req.flash('error', err.message || 'Gagal mengambil data untuk diedit.');
            return res.redirect('/posts'); 
        }

        if (rows.length === 0) {
            // Jika data tidak ditemukan
            req.flash('error', 'Data Post Dengan ID ' + id + ' Tidak Ditemukan');
            return res.redirect('/posts'); 
        } else {
            // Jika data ditemukan, render view 'posts/edit' dengan data post
            return res.render('posts/edit', { 
                id: rows[0].id,
                title: rows[0].title,
                content: rows[0].content 
            });
        }
    });
});

/**
 * UPDATE POST - Mengupdate Data
 */
router.post('/update/:id', function (req, res, next) {
    let id = req.params.id;
    let title = req.body.title;
    let content = req.body.content;
    let validationErrors = []; // Array untuk menyimpan pesan error validasi

    // --- Validasi Input ---
    if (title.length === 0) {
        validationErrors.push("Silahkan Masukkan Title");
    }
    if (content.length === 0) {
        validationErrors.push("Silahkan Masukkan Konten");
    }

    // --- Jika Ada Error Validasi ---
    if (validationErrors.length > 0) {
        // Gabungkan semua pesan error menjadi satu string dan set sebagai flash message
        req.flash('error', validationErrors.join(', '));
        // Render kembali form 'posts/edit' dengan data yang sudah diinput
        return res.render('posts/edit', { 
            id: id,
            title: title,
            content: content
        });
    }

    // --- Jika Tidak Ada Error (lanjut ke update query) ---
    let formData = {
        title: title,
        content: content
    };

    // Update query untuk mengupdate data di tabel tbl_33_post
    // PENTING: Menggunakan placeholder '?' untuk mencegah SQL Injection
    connection.query('UPDATE tbl_33_post SET ? WHERE id = ?', [formData, id], function (err, result) {
        if (err) {
            // Jika ada error dari database saat update
            req.flash('error', err.message || 'Gagal mengupdate data di database.');
            // Render kembali form 'posts/edit' dengan data yang sudah diinput
            return res.render('posts/edit', { 
                id: id,
                title: formData.title, 
                content: formData.content
            });
        } else {
            // Jika berhasil, set flash message sukses dan redirect ke halaman daftar posts
            req.flash('success', 'Data Berhasil Diupdate!');
            return res.redirect('/posts'); 
        }
    });
});

/**
 * DELETE POST - Menghapus Data
 */
router.post('/delete/:id', function (req, res, next) {
    let id = req.params.id;

    // Delete query untuk menghapus data dari tabel tbl_33_post
    // PENTING: Menggunakan placeholder '?' untuk mencegah SQL Injection
    connection.query('DELETE FROM tbl_33_post WHERE id = ?', [id], function (err, result) {
        if (err) {
            // Jika ada error saat menghapus data
            req.flash('error', err.message || 'Gagal menghapus data.');
            return res.redirect('/posts');
        } else {
            // Jika berhasil, set flash message sukses dan redirect ke halaman daftar posts
            req.flash('success', 'Data Berhasil Dihapus!');
            return res.redirect('/posts');
        }
    });
});

router.get('/delete/(:id)', function(req, res, next) {

    let id = req.params.id;

    connection.query('DELETE FROM tbl_33_post WHERE id = ' + id, function(err, result) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err)
            // redirect to posts page
            res.redirect('/posts')
        } else {
            // set flash message
            req.flash('success', 'Data Berhasil Dihapus!')
            // redirect to posts page
            res.redirect('/posts')
        }
    })

})
module.exports = router;
