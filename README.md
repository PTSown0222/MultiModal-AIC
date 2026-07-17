# Informative Video Retrivals

## Decompose The Bricks into Pieces

### Stage 1: Adjust Frame Extraction Methods
1. [ ] Shot Detection and Adaptive Sampler --> Select important frames (static only get 1 frame to motion frame (catch it))
2. [ ] Anotation and Captioning: Use a LLMs to caption a frame into metadata 

```python
metadata = {
        frame_id : "v3c1_id1",
        timestames" "80_000 - 90_000",
        caption: "something happened in this video",
}
```
   
### Stage 2: Select Embedding Models
1. [ ] Baseline: CLIP Model

## System Design

```text
=============================================================================
             SYSTEM DESCRIPTION INFORMATIVE RETRIEVAL (MULTI-STAGE)
=============================================================================

[ STAGE 1 and 2: OFFLINE PIPELINE ]

  📁 Video Scopus (5006 **/*.mp4)
          │
          ▼
  ⚙️ FFMPEG (Trimming Dense: 1/2 FPS) -> Advanced (Shot Detection and Adaptive Sampling)
          │
          ▼
  🖼️ Frame Scopus (1.5 millions Frames: 0ms, 500ms, 1000ms...)
          │
          ▼
  🧠 SigLIP Vision Encoder (Chạy Batch, ép kiểu FP16)
          │
          ▼
  🗄️ FAISS IndexIVFPQ -------> 💾 Lưu thành file: temporun.index


-----------------------------------------------------------------------------
[ GIAI ĐOẠN 3: FAST RECALL ] (Lọc thô siêu tốc - Lấy Top 100)

  📝 Text Query ("a man in red...")
          │
          ▼
  🧠 SigLIP Text Encoder 
          │ (Truy vấn)
          ▼
  🔍 FAISS Search <----------- 💾 Load file: temporun.index (từ ổ cứng)
          │
          ▼
  📑 Top-100 Frames Ứng viên


-----------------------------------------------------------------------------
[ GIAI ĐOẠN 4: CONTEXTUAL RERANKING ] (Tái xếp hạng - Lấy điểm chuẩn)

  📑 Top-100 Frames 
          │
          ▼ (Lấy thêm ±2 frames lân cận)
  🎞️ Context Window (Cửa sổ 5 frames / 1 ứng viên) 
          │
          ▼
  🤖 CUSTOM TEMPORAL CROSS-ENCODER (Mô hình PyTorch tự build)
      ↳ [Text Query] kết hợp [5 Frames] qua Multihead Attention
          │
          ▼
  📊 Điểm số khớp thô (Raw Matching Scores) của 100 ứng viên


-----------------------------------------------------------------------------
[ GIAI ĐOẠN 5: POST-PROCESSING ] (Tinh chỉnh & Nộp bài)

  📊 Điểm số khớp thô
          │
          ▼
  📈 Gaussian Smoothing (Làm mượt, tìm chính xác đỉnh chuông thời gian)
          │
          ▼
  🚫 1D-NMS (Xóa sổ các mốc thời gian trùng lặp trong bán kính ±5s)
          │
          ▼
  🏆 Bảng xếp hạng TOP 10 (video_id, frame_ms, rank)
          │
          ▼
  📁 Xuất file: submission.json

=============================================================================
```

Bước 1: Khởi tạo Môi trường & Sơ chế Dữ liệu (Dense Extraction): Thay vì nhổ lẻ tẻ I-frame, chúng ta sẽ "cào" dữ liệu một cách có hệ thống.
Môi trường: Khởi tạo project bằng uv để đảm bảo cài đặt các package (torch, faiss-gpu, ffmpeg-python, open_clip_torch) cực nhanh và quản lý dependency gọn gàng.Xử lý Video: Viết script gọi ffmpeg lặp qua 5006 clips. Cấu hình cờ -vf fps=2 để trích xuất chính xác 2 khung hình mỗi giây.Đầu ra: Thư mục chứa hàng triệu ảnh .jpg được đánh index mốc thời gian rõ ràng (ví dụ: 0ms, 500ms, 1000ms).

Bước 2: Xây dựng Bộ não Lưu trữ (Fast Embeddings & Indexing)Đây là khâu chuyển đổi hình ảnh thành số học.Mô hình: Tải trọng số của SigLIP (bản ViT-SO400M để cân bằng tốc độ/độ nét).Nhúng (Embedding): Chạy batch inference qua toàn bộ ảnh đã cắt. Ép kiểu vector về float16 để tiết kiệm RAM.Lập chỉ mục: Đừng lưu thành file Numpy thô ráp như baseline. Hãy nạp thẳng ma trận này vào FAISS IndexIVFPQ.Đầu ra: Một file .index lưu trên ổ cứng, sẵn sàng cho tốc độ tìm kiếm tính bằng mili-giây.

Bước 3: Lọc thô (Fast Recall) - Stage 1 của Inference: Khi nhận được câu truy vấn từ Ban tổ chức (ví dụ: "a man in a red jacket...").Đưa câu text qua Text Encoder của SigLIP để lấy vector truy vấn.Dùng FAISS quét qua hàng triệu khung hình, lấy ra Top-100 ứng viên có điểm Cosine Similarity cao nhất.Lưu ý: Lúc này chưa cần quan tâm việc chúng đến từ cùng một video hay khác video. Cứ lấy 100 khung hình giống mô tả nhất.

Bước 4: Tái xếp hạng Ngữ cảnh (Temporal Reranking) - Stage 2 của Inference Đây là nơi hệ thống của bạn bứt phá khỏi mức 0.387.Mở rộng ngữ cảnh: Với mỗi frame trong Top-100, "bốc" thêm 2 frame trước và 2 frame sau nó (tổng cộng cửa sổ 5 frames).Mô hình Reranker: Sử dụng mạng Custom Temporal Cross-Encoder (viết bằng PyTorch với lớp MultiheadAttention nhỏ gọn).Chấm điểm: Mô hình này sẽ cho text "nhìn" vào cả 5 frames cùng lúc để đánh giá sự chuyển động. Đầu ra là một điểm số thực (Matching Score) cho từng cụm ứng viên.

Bước 5: Hậu xử lý & Đóng gói (Post-Processing)Tuyệt đối không lấy thẳng điểm từ Bước 4 đem nộp.Làm mượt (Gaussian Smoothing): Chạy một bộ lọc 1D qua các điểm số của các frame đứng cạnh nhau trong cùng 1 video để tìm ra "đỉnh" thời gian (center point) chính xác nhất, triệt tiêu nhiễu.Khử trùng lặp thông minh (1D-NMS): Áp dụng Non-Maximum Suppression. Lấy mốc thời gian có điểm cao nhất làm Rank 1, sau đó tự động "xóa sổ" các mốc thời gian nằm trong bán kính $\pm 5$ giây quanh nó. Tiếp tục lấy mốc cao thứ hai làm Rank 2. Cách này giúp 1 video có thể đóng góp 2-3 mốc thời gian khác biệt nếu nó thực sự chứa nhiều cảnh khớp lệnh, thay vì bị vứt bỏ oan uổng như baseline.Đóng gói: Format kết quả thành submission.json và nén vào file ZIP theo đúng chuẩn của TempoRun 2026.

<img src="assets/systems.png" width="800" alt="Figure: System Deecription">

## How to Run

```shell

ROOT="./SUB_DATA_10CLIP_TEST"; DEV=cuda:0
KF=keyframes                 # Stage-1 output (fast local disk recommended)

# 1. Extract I-frames once (no GPU; shard across processes; resumable).
for i in 0 1 2 3 4 5; do
  .venv/bin/python extract_keyframes.py \
    --dataset-root "$ROOT/V3C1" --dataset-root "$ROOT/V3C2" \
    --out "$KF" --shard-index $i --shard-count 6
done

# 2. Embed the saved keyframes (GPU; resumable). Re-run with any encoder — no re-decode.
for i in 0 1 2 3 4 5; do
  CUDA_DEVICE_ORDER=PCI_BUS_ID CUDA_VISIBLE_DEVICES=0 \
  uv run extract_embed.py \
    --keyframes $KF --out artifacts/index --device $DEV \
    --model ViT-B-32 --pretrained laion2b_s34b_b79k \
    --shard-index $i --shard-count 6 &
done; wait
```