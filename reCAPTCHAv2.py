# ----------------------------------------
# Code by DagTri_Dev
# Facebook: https://facebok.com/dcmvcldcm
# Telegram: @DagTri_Dev
# ----------------------------------------
# Auto Bypass reCaptcha V2 (Audio) - Tối ưu hóa, giải thích chi tiết, comment siêu dễ hiểu!
# ----------------------------------------

import undetected_chromedriver as uc
from selenium.webdriver.support.wait import WebDriverWait 
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException

from pydub import AudioSegment
from pypasser.utils import download_audio
import speech_recognition as sr
import os
from time import sleep

class reCaptchaV2:
    """
    Lớp xử lý tự động vượt qua reCAPTCHA V2 dạng audio.
    Chỉ cần truyền vào WebDriver, hàm sẽ tự động thực thi toàn bộ quá trình
    từ click checkbox, chuyển sang thử thách audio, tải file, nhận diện giọng nói, nhập đáp án...
    Code chuẩn chỉnh, tối ưu retry, tự dọn file, dễ mở rộng!
    CRE: DagTri_Dev
    """

    def __new__(cls, driver, play=True, attempts=3):
        """
        Hàm khởi tạo tức thời __new__ giúp gọi class như 1 hàm, trả về True/False nếu thành công/không.
        Tự retry tối đa attempts lần nếu fail.
        """
        inst = super().__new__(cls)
        inst.__init__(driver, play, attempts)
        file_path = None
        try:
            cls._click_checkbox(driver)  # Bước 1: Click tick vào recaptcha
            if cls._is_checked(driver):  # Nếu đã tick xong => done
                return True

            cls._click_audio_button(driver)  # Bước 2: Chuyển sang thử thách audio
            while inst.attempts:
                inst.attempts -= 1
                link = cls._get_audio_link(driver, inst.play)  # Lấy link audio
                file_path = cls._to_wav(download_audio(link))  # Tải audio về, convert sang wav cho STT
                text = cls._speech_to_text(file_path)  # Nhận diện giọng nói (Speech-to-Text)
                cls._submit_text(driver, text)  # Nhập đáp án vào ô và Enter
                os.remove(file_path)
                if cls._is_checked(driver):  # Nếu vượt qua rồi thì done
                    return True
            return False

        except Exception as e:
            # Luôn dọn dẹp file tạm nếu có lỗi
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
            raise

    def __init__(self, driver, play, attempts):
        # Lưu lại các tham số cần thiết cho instance
        self.driver = driver
        self.play = play        # Có tự động play audio hay không
        self.attempts = attempts  # Số lần thử lại tối đa

    @staticmethod
    def _click_checkbox(driver):
        """
        Click tick vào ô reCAPTCHA checkbox
        """
        iframe = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "iframe[src*='api2/anchor']"))
        )
        driver.switch_to.frame(iframe)
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "recaptcha-anchor"))
        ).click()
        driver.switch_to.default_content()

    @staticmethod
    def _click_audio_button(driver):
        """
        Chuyển sang thử thách reCAPTCHA dạng audio (bấm nút loa)
        """
        iframe = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "iframe[src*='api2/bframe']"))
        )
        driver.switch_to.frame(iframe)
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "recaptcha-audio-button"))
        ).click()
        driver.switch_to.default_content()

    @staticmethod
    def _get_audio_link(driver, play):
        """
        Lấy link file audio mp3 thử thách captcha,
        Nếu 'play' = True thì tự động bấm nút play để nghe thử.
        """
        iframe = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "iframe[src*='api2/bframe']"))
        )
        driver.switch_to.frame(iframe)
        dl = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "rc-audiochallenge-tdownload-link"))
        )
        href = dl.get_attribute("href")
        if play:
            # Bấm nút play audio nghe thử (nếu muốn)
            WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, ".rc-audiochallenge-play-button > button"))
            ).click()
        driver.switch_to.default_content()
        return href

    @staticmethod
    def _submit_text(driver, text):
        """
        Nhập đoạn text nhận diện được vào ô đáp án captcha, sau đó Enter gửi đi
        """
        iframe = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "iframe[src*='api2/bframe']"))
        )
        driver.switch_to.frame(iframe)
        inp = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "audio-response"))
        )
        inp.send_keys(text, Keys.ENTER)
        driver.switch_to.default_content()

    @staticmethod
    def _is_checked(driver):
        """
        Kiểm tra trạng thái Checkbox reCAPTCHA đã được xác thực chưa.
        Trả về True nếu đã tick xanh, False nếu chưa.
        """
        sleep(2)  # Delay nhẹ để web cập nhật trạng thái
        iframe = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "iframe[src*='api2/anchor']"))
        )
        driver.switch_to.frame(iframe)
        try:
            driver.find_element(By.CLASS_NAME, "recaptcha-checkbox-checked")
            return True
        except NoSuchElementException:
            return False
        finally:
            driver.switch_to.default_content()

    @staticmethod
    def _to_wav(mp3_path: str) -> str:
        """
        Convert file mp3 sang wav (SpeechRecognition cần wav để nhận diện tốt)
        """
        wav = mp3_path.replace(".mp3", ".wav")
        AudioSegment.from_mp3(mp3_path).export(wav, format="wav")
        os.remove(mp3_path)
        return wav

    @staticmethod
    def _speech_to_text(wav_path: str) -> str:
        """
        Nhận diện giọng nói từ file wav, trả về kết quả dạng text.
        Nếu muốn nhận diện offline, có thể đổi sang recognize_sphinx.
        """
        r = sr.Recognizer()
        with sr.AudioFile(wav_path) as src:
            audio = r.record(src)
        try:
            return r.recognize_google(audio)  # Nhận diện online với Google STT
        except Exception:
            return ""  # Nếu fail thì trả về chuỗi rỗng cho lần thử tiếp theo

# ----------------------------------------
# Main: Demo sử dụng
# ----------------------------------------
if __name__ == "__main__":
    # 1. Khởi tạo undetected_chromedriver với config tối ưu hạn chế bị phát hiện
    options = uc.ChromeOptions()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-infobars")
    options.add_argument("--disable-dev-shm-usage")
    # Đặt User-Agent (có thể thay đổi cho phù hợp từng target)
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                         "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36")

    driver = uc.Chrome(options=options)
    driver.maximize_window()

    # 2. Truy cập website và click nút đầu tiên (DEMO)
    driver.get("https://bocaodientu.dkkd.gov.vn")
    btn = WebDriverWait(driver, 15).until(
        EC.element_to_be_clickable((By.XPATH,
            "/html/body/form/div[3]/div[2]/div[2]/div/div[2]/div[1]/div[2]/div[2]/div[1]/div[8]/div[1]/div[3]/input"
        ))
    )
    btn.click()
    sleep(5)  # Chờ web load

    # 3. Gặp reCAPTCHA thì gọi hàm bypass thần thánh!
    success = reCaptchaV2(driver)
    print("Bypass thành công!" if success else "Bypass thất bại.")

    # 4. (Tùy chọn) Tiếp tục thao tác khác...
    # driver.quit()

# ----------------------------------------
# CRE: DagTri_Dev - Tele: @DagTri_Dev - FB: https://facebok.com/dcmvcldcm
# ----------------------------------------