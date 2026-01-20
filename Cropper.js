let cropper;

inputFoto.onchange = function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    Swal.fire({
      title: 'Atur Foto Profil',
      html: `<img id="crop-image" src="${reader.result}" style="max-width:100%">`,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      didOpen: () => {
        const image = document.getElementById('crop-image');
        cropper = new Cropper(image, {
          aspectRatio: 1,
          viewMode: 1
        });
      }
    }).then(result => {
      if (result.isConfirmed) {
        const canvas = cropper.getCroppedCanvas({
          width: 400,
          height: 400
        });
        const base64 = canvas.toDataURL('image/jpeg');

        uploadFotoBase64(base64); // pakai fungsi upload lama
      }
    });
  };
  reader.readAsDataURL(file);
};
