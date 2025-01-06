import axios from "axios";

export const downloadFile = async (fileUrl, fileName) => {
    try {
        // URL에서 '?' 이후의 모든 부분을 제거
        const cleanUrl = fileUrl.split('?')[0]; // '?'부터 뒤의 모든 부분을 제거

        // fileUrl을 통해 파일 받아오기
        const response = await axios.get(cleanUrl, {
            responseType: 'blob',  // 응답을 Blob 형식으로 받기
        });

        // URL에서 확장자 추출 (예: '.png')
        const extension = cleanUrl.split('.').pop(); // URL에서 확장자 추출

        // 파일 이름에 확장자 추가 (파일 이름에 확장자가 없으면 자동으로 추가)
        const adjustedFileName = fileName.includes('.') ? fileName : `${fileName}.${extension}`;

        // Blob 데이터 생성
        const blob = new Blob([response.data]);

        // Blob 데이터를 Object URL로 변환
        const url = window.URL.createObjectURL(blob);

        // 다운로드를 위한 <a> 태그 생성
        const a = document.createElement('a');
        a.href = url; // Object URL 설정
        a.download = adjustedFileName; // 추론된 확장자를 포함한 파일 이름 설정

        // <a> 태그를 body에 추가하고 클릭 이벤트 발생
        document.body.appendChild(a);
        a.click();

        // 메모리 해제 및 DOM 정리
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('파일을 다운로드 중 에러가 발생했습니다.:', error);
    }
};
