package com.miempresa.backend_tfg.config;

import com.miempresa.backend_tfg.entity.Quiz;
import com.miempresa.backend_tfg.model.Level;
import com.miempresa.backend_tfg.model.QuizQuestionType;
import com.miempresa.backend_tfg.repository.QuizJpaRepository;

/**
 * Fills the DB with exactly {@code target} quiz rows, evenly distributed
 * across every Level × QuizQuestionType combination (6 × 4 = 24 combos).
 *
 * With target=480: 480/24 = 20 questions per combo, covering every level
 * with all four question types (GRAMMAR, VOCABULARY, READING, IDIOMS).
 *
 * Correct answer is always optA (index 0).
 * The front-end shuffles options before display so optA is never predictable.
 */
public final class QuizBulkSeeder {

    private QuizBulkSeeder() {}

    public static void ensureQuestionCount(QuizJpaRepository repo, int target) {
        long total = repo.count();
        if (total == target && isWellDistributed(repo)) return;
        repo.deleteAll();

        Level[] levels = Level.values();                 // 6
        QuizQuestionType[] types = QuizQuestionType.values(); // 4
        int combos   = levels.length * types.length;    // 24
        int perCombo = target / combos;                  // 20

        for (Level level : levels) {
            for (QuizQuestionType type : types) {
                for (int v = 0; v < perCombo; v++) {
                    repo.save(buildQuestion(level, type, v));
                }
            }
        }
    }

    /* Returns false if any level×type combination has zero questions (bad distribution). */
    private static boolean isWellDistributed(QuizJpaRepository repo) {
        for (Level l : Level.values()) {
            for (QuizQuestionType t : QuizQuestionType.values()) {
                if (repo.countByLevelAndQuestionType(l, t) == 0) return false;
            }
        }
        return true;
    }

    private static Quiz buildQuestion(Level level, QuizQuestionType type, int v) {
        return switch (type) {
            case GRAMMAR    -> grammar(level, v);
            case VOCABULARY -> vocabulary(level, v);
            case READING    -> reading(level, v);
            case IDIOMS     -> idioms(level, v);
        };
    }

    // ═══════════════════════════ GRAMMAR ═══════════════════════════

    private static Quiz grammar(Level level, int v) {
        String[][] rows = switch (level) {
            case A1, A2 -> new String[][]{
                {"I ___ happy today.", "am", "is", "are", "be"},
                {"She ___ not like coffee.", "does", "do", "did", "doing"},
                {"They ___ playing football now.", "are", "is", "am", "be"},
                {"We ___ to school yesterday.", "went", "go", "goes", "going"},
                {"He ___ breakfast every morning.", "has", "have", "having", "had"},
                {"There ___ some milk in the fridge.", "is", "are", "be", "were"},
                {"___ you like some tea?", "Would", "Do", "Are", "Have"},
                {"She ___ to the cinema last Friday.", "went", "goes", "go", "going"},
                {"___ he have any brothers or sisters?", "Does", "Do", "Is", "Has"},
                {"They ___ English at school.", "learn", "learns", "is learning", "learned"},
                {"I ___ reading a good book right now.", "am", "is", "be", "are"},
                {"She ___ arrived home yet.", "hasn't", "didn't", "isn't", "don't"},
                {"We ___ go to the park tomorrow.", "are going to", "go", "goes", "went"},
                {"___ he tall or short?", "Is", "Are", "Do", "Does"},
                {"There ___ a cat in the garden.", "is", "are", "be", "am"},
                {"I ___ a student at this school.", "am", "be", "are", "is"},
                {"She ___ her homework before dinner.", "did", "does", "do", "doing"},
                {"We ___ TV every evening.", "watch", "watches", "watching", "watched"},
                {"___ you from Spain?", "Are", "Is", "Do", "Be"},
                {"He ___ like pizza.", "doesn't", "don't", "isn't", "aren't"},
            };
            case B1 -> new String[][]{
                // Past Simple / Past Continuous (5)
                {"While the policeman ___ out of the window, he ___ a fight break out.", "was looking / noticed", "looked / was noticing", "was looking / was noticing", "looked / noticed"},
                {"I ___ TV when my friend ___.", "was watching / called", "watched / was calling", "was watching / was calling", "watched / called"},
                {"When she arrived, we ___ lunch.", "were having", "had", "have had", "are having"},
                {"They ___ football when it started to rain.", "were playing", "played", "play", "have played"},
                {"He ___ his keys while he ___ to work.", "lost / was walking", "was losing / walked", "lost / walked", "was losing / was walking"},
                // Mixed Verb Tenses (5)
                {"I ___ to Paris three times so far this year.", "have been", "went", "go", "was"},
                {"By the time you arrive, I ___ dinner.", "will have cooked", "will cook", "have cooked", "am cooking"},
                {"She ___ in London for five years when she decided to move.", "had been living", "has been living", "was living", "lived"},
                {"I ___ him since we were at school together.", "have known", "know", "knew", "had known"},
                {"When I was young, I ___ to school by bike.", "used to go", "was going", "have gone", "would have gone"},
                // Adjective Forms / Comparatives (5)
                {"This is ___ book I have ever read.", "the most interesting", "more interesting", "the interestingest", "most interesting"},
                {"She speaks English ___ than her brother.", "more fluently", "more fluent", "most fluently", "fluently"},
                {"Of the two routes, the mountain path is ___.", "the longer", "the longest", "longer", "more long"},
                {"The results were ___ than we had hoped.", "better", "more good", "more better", "the best"},
                {"He worked ___ to finish the report on time.", "hard", "hardly", "harder", "hardest"},
                // Reported Speech (5)
                {"'I live in Paris,' she said. → She said that she ___ in Paris.", "lived", "lives", "had lived", "would live"},
                {"'I will call you tomorrow,' he said. → He said that he ___ call me the next day.", "would", "will", "is going to", "shall"},
                {"'Are you coming to the party?' she asked me. → She asked me if I ___ to the party.", "was coming", "am coming", "come", "will come"},
                {"'Don't forget your keys,' my mum said. → My mum told me ___ my keys.", "not to forget", "to not forget", "don't forget", "not forgetting"},
                {"'We have finished the report,' they said. → They said that they ___ the report.", "had finished", "have finished", "finished", "would finish"},
            };
            case B2 -> new String[][]{
                {"If I ___ you, I would study more.", "were", "am", "was", "be"},
                {"The letter ___ by the time we arrived.", "had been sent", "was sent", "sent", "sends"},
                {"She suggested ___ a break.", "taking", "to take", "take", "took"},
                {"I wish I ___ how to swim.", "knew", "know", "known", "knowing"},
                {"This time next week, we ___ on the beach.", "will be lying", "lie", "will lie", "lied"},
                {"He ___ working here since 2019.", "has been", "is", "was", "had"},
                {"Unless you hurry, you ___ the train.", "will miss", "miss", "missed", "are missing"},
                {"The report ___ before the meeting starts.", "must be submitted", "must submit", "submits", "is submitting"},
                {"She ___ have left — her coat is still here.", "can't", "must", "might", "should"},
                {"By the time he arrived, the food ___.", "had already been eaten", "was already eaten", "has been eaten", "is already eaten"},
                {"It's high time we ___ the problem seriously.", "took", "take", "taking", "would take"},
                {"He ___ the exam three times before he passed.", "had taken", "took", "has taken", "was taking"},
                {"She is used to ___ early.", "getting up", "get up", "got up", "gets up"},
                {"I would rather you ___ tell anyone.", "didn't", "don't", "won't", "haven't"},
                {"The longer you wait, the ___ it becomes.", "harder", "hard", "hardest", "more hard"},
                {"___ I known about the problem, I would have helped.", "Had", "Have", "If", "Would"},
                {"She insisted on ___ the bill.", "paying", "pay", "to pay", "paid"},
                {"He ___ be exhausted — he's been working since 5 a.m.", "must", "can", "could", "might"},
                {"This is the best film I ___.", "have ever seen", "ever saw", "ever see", "ever have seen"},
                {"She ___ to help us if she had known.", "would have offered", "would offer", "had offered", "offered"},
            };
            case C1 -> new String[][]{
                {"If she ___ harder at school, she would be in a better position now.", "had worked", "worked", "has worked", "were working"},
                {"___ he accepted the offer, he would have stayed in the company.", "Had", "If", "Would", "Should"},
                {"It was the marketing team ___ came up with the original concept.", "that", "which", "who", "whose"},
                {"___ in a hurry, she forgot to attach the file to the email.", "Being", "Having been", "To be", "Since she was"},
                {"The proposal must ___ before the end of the fiscal year.", "be approved", "approved", "have approved", "be approving"},
                {"It is vital that every participant ___ the form in advance.", "complete", "completes", "has completed", "will complete"},
                {"Not only ___ the project on time, but the team also came in under budget.", "did they deliver", "they delivered", "have they delivered", "they did deliver"},
                {"___ the report, the analysts discovered several inconsistencies.", "Having reviewed", "Reviewing", "After reviewing", "By reviewing"},
                {"The regulations, ___ in 2019, have since been updated twice.", "introduced", "introducing", "which introduced", "having introduced"},
                {"I wish I ___ the situation differently at the time.", "had handled", "handled", "would handle", "could handle"},
                {"The meeting could ___ cancelled had more people raised objections.", "have been", "be", "have", "been"},
                {"We had the old system ___ by an external IT consultant.", "upgraded", "upgrade", "upgrading", "to upgrade"},
                {"Were she to resign, the board ___ considerable difficulty replacing her.", "would face", "will face", "faces", "would have faced"},
                {"She suggested that the committee ___ the proposal once more.", "reconsider", "reconsiders", "should reconsider", "reconsidering"},
                {"He finished the project in record time, ___ the board very impressed.", "leaving", "left", "having left", "to leave"},
                {"I ___ understand why you are frustrated, but shouting will not help.", "do", "am", "have", "did"},
                {"What struck the reviewers most ___ the originality of the approach.", "was", "were", "is", "had been"},
                {"___ the results were encouraging, the researchers cautioned against drawing firm conclusions.", "Although", "Despite", "However", "Nevertheless"},
                {"Rarely ___ such a clear correlation in social science data.", "do researchers find", "researchers find", "researchers do find", "found researchers"},
                {"___ you require further assistance, please do not hesitate to contact us.", "Should", "Would", "If", "Were"},
            };
            case C2 -> new String[][]{
                {"Rarely ___ such a brilliant performance.", "have I seen", "I have seen", "I seen", "seen I have"},
                {"Were I in charge, I ___ the policy immediately.", "would change", "will change", "change", "changed"},
                {"Little ___ that she had already left the building.", "did he know", "he knew", "knew he", "he did know"},
                {"So fast ___ that nobody could react.", "did he run", "he ran", "ran he", "he did ran"},
                {"Not until Monday ___ the final results.", "did we receive", "we received", "received we", "we did receive"},
                {"Hardly ___ the door when the phone rang.", "had she closed", "she closed", "she had closed", "closed she"},
                {"Only later ___ the full truth about the case.", "did they realise", "they realised", "realised they", "they did realise"},
                {"No sooner ___ than the lights went out.", "had he arrived", "he had arrived", "arrived he", "he arrived"},
                {"It is imperative that every delegate ___ the session.", "attend", "attends", "attending", "has attended"},
                {"Seldom ___ such an egregious error in published work.", "does one encounter", "one encounters", "one does encounter", "encounters one"},
                {"The proposal, though well-intentioned, ___ have been better framed.", "might", "will", "shall", "must"},
                {"___ she to resign, the company would face serious difficulties.", "Were", "Should", "Had", "Would"},
                {"By the time the audit is complete, the team ___ the project for two years.", "will have been running", "will run", "has been running", "is running"},
                {"Not only ___ the deadline, but she also exceeded expectations.", "did she meet", "she met", "met she", "she did meet"},
                {"It is essential that the data ___ before publication.", "be verified", "is verified", "was verified", "will be verified"},
                {"Under no circumstances ___ to discuss confidential matters.", "are staff permitted", "staff are permitted", "staff permitted", "are permitted staff"},
                {"The findings, ___ they may be, demand further investigation.", "inconclusive as", "as inconclusive", "though inconclusive", "inconclusive though"},
                {"He ___ the implications of his statement before speaking.", "ought to have considered", "ought to consider", "should consider", "had considered"},
                {"The more evidence we gather, the ___ the picture becomes.", "clearer", "more clear", "clearly", "most clear"},
                {"Such ___ the complexity of the issue that no single answer suffices.", "is", "are", "was", "were"},
            };
        };
        String[] r = rows[v % rows.length];
        return make(level, QuizQuestionType.GRAMMAR, "[" + level + "] " + r[0], r[1], r[2], r[3], r[4], 0);
    }

    // ═══════════════════════════ VOCABULARY ═══════════════════════════

    private static Quiz vocabulary(Level level, int v) {
        String[][] rows = switch (level) {
            case A1, A2 -> new String[][]{
                {"The opposite of 'hot' is ___ .", "cold", "warm", "cool", "dry"},
                {"A person who flies a plane is a ___ .", "pilot", "driver", "sailor", "chef"},
                {"Something very small is ___ .", "tiny", "huge", "wide", "heavy"},
                {"To speak very quietly is to ___ .", "whisper", "shout", "argue", "laugh"},
                {"The day after Wednesday is ___ .", "Thursday", "Tuesday", "Friday", "Sunday"},
                {"Frozen water is ___ .", "ice", "steam", "sand", "wood"},
                {"A place where you borrow books is a ___ .", "library", "hospital", "station", "factory"},
                {"When you feel worried, you feel ___ .", "nervous", "bored", "delighted", "lazy"},
                {"To use money to buy something is to ___ it.", "spend", "lend", "float", "break"},
                {"Something you wear on your feet is called ___ .", "shoes", "gloves", "a hat", "a scarf"},
                {"The colour of grass is ___ .", "green", "blue", "red", "yellow"},
                {"Your mother's mother is your ___ .", "grandmother", "aunt", "sister", "cousin"},
                {"You use this to write on paper: a ___ .", "pen", "key", "plate", "spoon"},
                {"The meal you eat in the morning is ___ .", "breakfast", "lunch", "dinner", "dessert"},
                {"You travel under the city on the ___ .", "metro", "bus", "tram", "ferry"},
                {"The opposite of 'cheap' is ___ .", "expensive", "free", "old", "light"},
                {"A doctor works in a ___ .", "hospital", "school", "shop", "library"},
                {"You use this to unlock a door: a ___ .", "key", "brush", "fork", "coin"},
                {"Cats and dogs are common ___ .", "pets", "tools", "jobs", "sports"},
                {"In January, the weather is usually ___ .", "cold", "hot", "sunny", "dry"},
            };
            case B1 -> new String[][]{
                // Prepositions (20)
                {"The situation is ___ control.", "under", "in", "at", "on"},
                {"She's very good ___ maths.", "at", "in", "on", "for"},
                {"He is interested ___ learning new languages.", "in", "at", "about", "on"},
                {"They arrived ___ the airport on time.", "at", "in", "to", "on"},
                {"I'm looking forward ___ seeing you.", "to", "for", "at", "about"},
                {"She apologised ___ being late.", "for", "about", "to", "of"},
                {"He insisted ___ paying the bill.", "on", "in", "for", "at"},
                {"Are you aware ___ the risks?", "of", "about", "for", "with"},
                {"She is responsible ___ the marketing department.", "for", "of", "at", "about"},
                {"I'm not very good ___ cooking.", "at", "in", "about", "for"},
                {"He succeeded ___ passing the exam.", "in", "at", "on", "for"},
                {"We rely ___ public transport every day.", "on", "at", "in", "for"},
                {"She is afraid ___ flying.", "of", "about", "from", "for"},
                {"I congratulated him ___ passing his driving test.", "on", "for", "about", "at"},
                {"They are proud ___ their daughter's achievements.", "of", "about", "for", "in"},
                {"He is addicted ___ social media.", "to", "on", "for", "in"},
                {"She was surprised ___ the news.", "by", "with", "at", "about"},
                {"They complained ___ the noise.", "about", "of", "for", "at"},
                {"I am tired ___ waiting.", "of", "from", "about", "with"},
                {"He is married ___ a doctor.", "to", "with", "at", "for"},
            };
            case B2 -> new String[][]{
                // Phrasal Verbs (5)
                {"To 'break into' a building means to ___ .", "enter it illegally by force", "renovate it from the inside", "demolish it completely", "lock it securely"},
                {"To 'cross out' a word means to ___ .", "draw a line through it to delete it", "underline it for emphasis", "spell it differently", "move it to another position"},
                {"To 'look into' a problem means to ___ .", "investigate it carefully", "ignore it completely", "solve it immediately", "report it to others"},
                {"To 'put off' a meeting means to ___ .", "postpone it to a later time", "cancel it permanently", "shorten its duration", "make it more formal"},
                {"To 'take on' a new employee means to ___ .", "hire them", "fire them", "train them for a new role", "promote them"},
                // Word Formation (5)
                {"The adjective form of 'nerve' is ___ .", "nervous", "nerved", "nerving", "nerveful"},
                {"The noun form of 'achieve' is ___ .", "achievement", "achieval", "achieving", "achiever"},
                {"The adverb form of 'obvious' is ___ .", "obviously", "obvious", "obviousness", "more obvious"},
                {"The opposite of 'responsible' is ___ .", "irresponsible", "unresponsible", "disresponsible", "nonresponsible"},
                {"The noun form of 'discuss' is ___ .", "discussion", "discussing", "discussment", "discusses"},
                // Prepositions with adjectives/verbs (5)
                {"He is capable ___ doing much better.", "of", "at", "in", "for"},
                {"She is committed ___ improving her English.", "to", "in", "at", "for"},
                {"I am concerned ___ the rising cost of living.", "about", "of", "at", "for"},
                {"He was accused ___ stealing the money.", "of", "for", "about", "with"},
                {"The new policy is aimed ___ reducing unemployment.", "at", "to", "for", "of"},
                // Connectives / Linking Words (5)
                {"___ the heavy rain, the match continued.", "Despite", "Although", "However", "Because"},
                {"She studied hard; ___ , she failed the exam.", "nevertheless", "therefore", "moreover", "furthermore"},
                {"The hotel was expensive. ___ , the service was excellent.", "However", "Nevertheless", "Moreover", "Therefore"},
                {"You can borrow my car ___ you drive carefully.", "as long as", "despite", "nevertheless", "in spite of"},
                {"___ being tired, she finished all her work.", "Despite", "Although", "However", "Because"},
            };
            case C1 -> new String[][]{
                {"Which verb collocates most naturally with 'consensus'?", "reach", "make", "do", "get"},
                {"To 'alleviate' a problem means to ___ .", "reduce its severity", "eliminate it completely", "describe it accurately", "identify its cause"},
                {"'Pragmatic' describes someone who ___ .", "focuses on practical solutions", "follows rules strictly", "refuses to compromise", "avoids difficult decisions"},
                {"Which word means 'widespread and difficult to avoid'?", "pervasive", "selective", "sporadic", "marginal"},
                {"To 'mitigate' risks means to ___ .", "lessen their impact", "eliminate them entirely", "identify their source", "report them formally"},
                {"'Ambivalent' feelings are ___ .", "mixed or contradictory", "entirely positive", "entirely negative", "very intense"},
                {"To 'scrutinise' something means to ___ .", "examine it very carefully", "ignore it completely", "challenge it publicly", "summarise it briefly"},
                {"'Paramount' importance means ___ .", "of the greatest importance", "of little importance", "of average importance", "of growing importance"},
                {"Which verb collocates best with 'precedent'?", "set", "make", "do", "give"},
                {"'Detrimental' effects are ___ .", "harmful", "beneficial", "neutral", "minor"},
                {"To 'convey' information means to ___ .", "communicate or express it", "withhold it deliberately", "distort it deliberately", "repeat it unnecessarily"},
                {"A 'pivotal' moment is ___ .", "a critical turning point", "a minor forgettable event", "an unexpected outcome", "a regularly occurring pattern"},
                {"'Meticulous' work is ___ .", "extremely careful and precise", "done very quickly", "based on intuition", "focused only on the big picture"},
                {"To 'consolidate' a position means to ___ .", "make it stronger and more stable", "abandon it entirely", "make it more complex", "share it with others"},
                {"'Plausible' means ___ .", "believable and reasonable", "definitely true", "impossible to verify", "clearly false"},
                {"Which adjective means 'using very few words; brief and clear'?", "concise", "verbose", "ambiguous", "comprehensive"},
                {"To 'foster' creativity means to ___ .", "encourage and develop it", "discourage and suppress it", "measure and evaluate it", "demand and require it"},
                {"'Contentious' issues are ___ .", "likely to cause disagreement", "widely agreed upon", "difficult to understand", "easy to resolve"},
                {"To 'substantiate' a claim means to ___ .", "provide evidence to support it", "contradict it with data", "question its relevance", "rephrase it more clearly"},
                {"'Stringent' regulations are ___ .", "very strict and demanding", "flexible and adaptable", "recently introduced", "widely criticised"},
            };
            case C2 -> new String[][]{
                {"Which verb collocates most naturally with 'ambiguity'?", "dispel", "solve", "fix", "erase"},
                {"'Ubiquitous' describes something that is ___ .", "found everywhere", "completely absent", "rarely observed", "highly exclusive"},
                {"'Perfunctory' describes an action carried out ___ .", "as a routine, without care", "with great precision", "under extreme pressure", "in a highly creative way"},
                {"Choose the word closest in meaning to 'corroborate'.", "confirm with supporting evidence", "contradict firmly", "suggest tentatively", "exaggerate slightly"},
                {"'To prevaricate' means to ___ .", "speak evasively to avoid committing to an answer", "state facts with absolute clarity", "make a firm and final decision", "repeat the same point unnecessarily"},
                {"'Equivocal' evidence is ___ .", "open to more than one interpretation", "conclusively in favour of one side", "scientifically proven beyond doubt", "completely irrelevant"},
                {"Which adjective means 'having very good judgement and understanding'?", "perspicacious", "ostentatious", "loquacious", "tenacious"},
                {"'Commensurate with' means ___ .", "proportional or appropriate to", "completely unrelated to", "superior compared to", "dependent upon the outcome of"},
                {"The word 'nugatory' means ___ .", "of no importance; worthless", "extremely valuable or rare", "overly complex", "carefully considered"},
                {"'To temporise' means to ___ .", "delay a decision by being deliberately vague", "act with great speed and precision", "offer a formal apology", "insist on a specific time frame"},
                {"'Inveterate' describes a habit or behaviour that is ___ .", "long-established and unlikely to change", "recently developed", "highly praised by others", "formally approved"},
                {"'Mendacious' means ___ .", "not telling the truth; dishonest", "extremely generous", "slow to react", "outwardly confident"},
                {"A 'polemic' is ___ .", "a strong, often aggressive piece of argument", "a neutral, balanced overview", "a personal diary entry", "a list of key facts"},
                {"'Circumspect' behaviour is ___ .", "careful and cautious before acting", "bold and decisive", "completely spontaneous", "very slow and inefficient"},
                {"'To gainsay' something means to ___ .", "deny or contradict it", "confirm it formally", "quote it accurately", "ignore it completely"},
                {"'Apocryphal' stories are ___ .", "widely told but probably not true", "verified by multiple sources", "published in official records", "based on personal experience"},
                {"'Laconic' speech is ___ .", "brief and to the point", "long-winded and elaborate", "spoken very loudly", "technically complex"},
                {"The word 'recondite' describes knowledge that is ___ .", "known only to a few specialists", "widely taught in schools", "easily understood by all", "recently discovered"},
                {"'Inexorable' means ___ .", "impossible to stop or prevent", "easy to reverse or change", "highly likely but not certain", "desirable and welcome"},
                {"'Tendentious' writing is ___ .", "strongly promoting a particular point of view", "completely objective and balanced", "factually inaccurate throughout", "aimed at children"},
            };
        };
        String[] r = rows[v % rows.length];
        return make(level, QuizQuestionType.VOCABULARY, "[" + level + "] " + r[0], r[1], r[2], r[3], r[4], 0);
    }

    // ═══════════════════════════ READING ═══════════════════════════

    private static Quiz reading(Level level, int v) {
        String[][] rows = switch (level) {
            case A1, A2 -> new String[][]{
                {"In the sentence 'The dog barked loudly', what did the dog do?", "Made a loud sound", "Slept quietly", "Ran away quickly", "Ate its food"},
                {"'She opened the window.' What happened to the window?", "It became open", "It broke", "It fell to the ground", "It was painted"},
                {"'They missed the bus.' What does this suggest?", "They arrived at the stop too late", "They liked the bus", "They sold the bus", "They built a bus"},
                {"'The soup tastes salty.' What can we infer?", "There is a lot of salt in it", "The soup is cold", "Nobody ate the soup", "The soup is a dessert"},
                {"'He borrowed my pen.' Who will use the pen first?", "He will", "I will", "Nobody will use it", "The teacher will"},
                {"'Please close the door quietly.' What does the speaker want?", "A quiet action", "A loud action", "No action at all", "Help moving the door"},
                {"'It is raining outside.' What can we say about the weather?", "It is wet", "It is sunny", "It is cold", "It is windy"},
                {"'Maria is taller than her brother.' Who is shorter?", "Her brother", "Maria", "They are the same height", "We cannot tell"},
                {"'The cat sat on the mat.' Where was the cat?", "On the mat", "Under the mat", "Next to the mat", "Inside the mat"},
                {"'He is seven years old.' How old is he?", "Seven", "Seventeen", "Seventy", "We don't know"},
                {"'She drinks two glasses of water every day.' How often does she drink water?", "Every day", "Every week", "Twice a week", "Once a month"},
                {"'The car is red.' What colour is the car?", "Red", "Blue", "Green", "Yellow"},
                {"'John likes football but his sister prefers tennis.' Who prefers tennis?", "John's sister", "John", "Both of them", "Neither of them"},
                {"'The shop is closed on Sundays.' Can you shop there on Sunday?", "No, you cannot", "Yes, you can", "Only in the morning", "Only if you call first"},
                {"'She smiled when she saw the gift.' How did she feel?", "Happy or pleased", "Angry", "Sad", "Confused"},
                {"'He ran to catch the train.' Why did he run?", "He wanted to catch the train", "He was doing exercise", "He was scared", "He was late for school"},
                {"'The book costs five euros.' Is the book free?", "No, it has a price", "Yes, it is free", "It depends on the day", "We don't know"},
                {"'She is my younger sister.' Who is older?", "I am", "My sister is", "We are the same age", "We cannot tell"},
                {"'It was the best film I have ever seen.' Did the speaker enjoy the film?", "Yes, very much", "No, not at all", "It was just average", "We cannot say"},
                {"'He forgot his umbrella.' What does this suggest about the weather?", "It may rain", "It is very hot", "The weather is perfect", "It is very windy"},
            };
            case B1 -> new String[][]{
                {"'Although she worked hard, she failed the exam.' What does 'although' tell us?", "There is a contrast between effort and result", "She worked hard because she failed", "She will work harder next time", "She enjoyed working hard"},
                {"'The committee postponed the decision pending further review.' What does this mean?", "The decision was delayed for more information", "The decision was cancelled permanently", "The committee agreed immediately", "The review had already been completed"},
                {"'On the other hand' introduces ___ .", "a contrasting point or perspective", "an example of the previous idea", "a final conclusion", "a time reference"},
                {"'Companies often overlook the long-term costs of employee turnover.' What does 'overlook' mean here?", "fail to notice or consider", "look over carefully", "report officially", "calculate with precision"},
                {"'Despite the setbacks, the project was completed on time.' What can we conclude?", "The team overcame difficulties successfully", "The project was abandoned", "There were no problems at all", "The deadline was extended"},
                {"'The author implies that urban growth is unsustainable.' What does 'implies' suggest?", "The idea is suggested but not directly stated", "The author states this as a proven fact", "The author disagrees with the idea", "The reader must verify this independently"},
                {"'The results were inconclusive.' What does this tell us about the experiment?", "No clear conclusion could be drawn", "The experiment was a clear success", "The results were faked", "The experiment was not completed"},
                {"'Many attribute the decline to poor management.' What does 'attribute' mean?", "assign as a cause or reason", "describe in detail", "ignore completely", "disprove with evidence"},
                {"'Contrary to popular belief, more sleep does not always improve academic performance.' The phrase 'contrary to popular belief' signals ___ .", "the following information challenges a common assumption", "the following information confirms what most people think", "the author is uncertain about the claim", "the reader should ignore this claim"},
                {"'The policy had unintended consequences.' What does 'unintended' tell us?", "The effects were not planned or expected", "The effects were carefully planned", "The effects were fully understood in advance", "The policy worked exactly as hoped"},
                {"'She read between the lines of his message.' This means she ___ .", "understood the hidden meaning", "could not read the message clearly", "read the message very slowly", "printed the message out"},
                {"'The review praised the novel's pacing but criticised its character development.' Overall the review is ___ .", "mixed — both positive and negative", "entirely negative", "entirely positive", "focused only on the plot"},
                {"'The more you practise, the more confident you become.' This sentence expresses ___ .", "a direct proportional relationship", "a contradiction", "an opinion that is hard to prove", "a past experience"},
                {"'The evidence strongly suggests a link between diet and mood.' The word 'suggests' implies ___ .", "the link is probable but not proven", "the link is absolutely certain", "there is no link", "the evidence is weak"},
                {"'While the government has made progress, much remains to be done.' This sentence is ___ .", "cautiously optimistic", "completely negative", "completely positive", "neutral and factual"},
                {"'She had barely sat down when the phone rang.' What happened?", "The phone rang almost immediately after she sat", "She was on the phone for a long time", "She did not sit down at all", "The phone rang before she arrived"},
                {"'He spoke at length about the problem, yet offered no solutions.' What is the criticism?", "He talked a lot but was not helpful", "He talked too little about the problem", "He offered too many solutions", "He refused to speak at all"},
                {"'Access to the site is restricted to authorised personnel.' Who can enter the site?", "Only people with official permission", "Anyone who wants to", "Only managers and directors", "Only visitors with an appointment"},
                {"'The campaign aimed to raise awareness, not raise funds.' The main goal was ___ .", "to inform people, not collect money", "to collect money, not inform people", "to do both equally", "to do neither"},
                {"'Studies show that bilingual children often outperform peers in problem-solving.' 'Peers' refers to ___ .", "other children of the same age and background", "their teachers", "their parents", "children who are much older"},
            };
            case B2 -> new String[][]{
                {"'The study concludes that further research is needed.' This phrase suggests ___ .", "the current findings are inconclusive or incomplete", "the research is finished and final", "no further work can be done on this topic", "the conclusions are well-established"},
                {"'The author acknowledges the limitations of the study.' This means the author ___ .", "admits the study has weaknesses", "claims the study is perfect", "refuses to draw conclusions", "recommends ignoring the results"},
                {"'The scheme has come under considerable scrutiny.' This means it ___ .", "has been examined very carefully and critically", "has been praised by most experts", "has been abandoned completely", "has been simplified for public use"},
                {"'The report paints a bleak picture of the current situation.' 'Bleak' implies ___ .", "very negative and without hope", "complicated and unclear", "promising but uncertain", "mixed and debatable"},
                {"'Despite initial resistance, the proposal gained traction.' This means ___ .", "over time it started to get more support", "it was rejected after some debate", "it was implemented without any problems", "resistance to it increased over time"},
                {"'The findings challenge long-held assumptions in the field.' This means ___ .", "the results contradict widely accepted ideas", "the results confirm existing theories", "the methodology is controversial", "the field has not previously studied this"},
                {"'Access to information alone does not guarantee informed decision-making.' This sentence implies ___ .", "having information is not enough — other factors matter", "people with more information make worse decisions", "access to information is unnecessary", "informed decisions are impossible"},
                {"'The policy has had mixed results.' This means ___ .", "it has worked well in some areas but not others", "it has completely failed in all areas", "it has succeeded beyond all expectations", "its results cannot yet be measured"},
                {"'Critics argue that the benefits have been overstated.' This means the critics believe ___ .", "the benefits have been exaggerated", "the benefits are exactly as described", "there are no benefits at all", "the benefits are more significant than stated"},
                {"'The committee was divided on the issue.' This means ___ .", "members had different opinions and could not agree", "the committee voted unanimously in favour", "the committee refused to discuss the issue", "all members eventually reached an agreement"},
                {"'The text implies, without stating directly, that funding was misused.' The word 'implies' suggests ___ .", "the suggestion is indirect and requires interpretation", "the claim is stated as a proven fact", "the reader is expected to disagree with this", "the author is uncertain of their own view"},
                {"'A growing body of evidence suggests a link.' 'A growing body of evidence' means ___ .", "an increasing amount of research supporting the idea", "one very large and important study", "a scientific organisation that researches the topic", "a conclusion that scientists now agree upon"},
                {"'The argument relies heavily on anecdotal evidence.' This is presented as ___ .", "a weakness in the argument's reasoning", "a strength that makes the argument convincing", "an unusual and creative approach", "an unbiased way of supporting a claim"},
                {"'The article takes a neutral stance on the issue.' This means the writer ___ .", "does not express a personal opinion for or against", "supports one side clearly", "disagrees with both sides equally", "avoids discussing the issue altogether"},
                {"'While progress has been made, significant challenges remain.' The overall message is ___ .", "things have improved but more work is needed", "the situation is now fully resolved", "progress has not occurred at all", "challenges make progress impossible"},
                {"'The initiative was piloted in three cities before being rolled out nationally.' 'Piloted' means ___ .", "tested on a small scale first", "launched everywhere simultaneously", "funded by private companies", "cancelled after one year"},
                {"'The author draws on a wide range of sources to support their argument.' This suggests the argument is ___ .", "well-researched and broad in scope", "based on personal experience only", "difficult to follow without expert knowledge", "focused on a single narrow perspective"},
                {"'The data was collected over a ten-year period.' This detail is most likely included to ___ .", "show the study is long-term and reliable", "explain why the study was expensive", "describe the team that collected the data", "identify when the study was first published"},
                {"'He was reluctant to commit to a specific timeline.' 'Commit' in this context means ___ .", "make a firm promise or agreement", "attend a meeting", "write a formal document", "decide on a general topic"},
                {"'The graph shows a sharp decline followed by a gradual recovery.' What pattern does the graph show?", "first a rapid fall, then a slow rise", "first a slow fall, then a rapid rise", "a steady fall throughout the period", "a continuous rise throughout the period"},
            };
            case C1 -> new String[][]{
                {"'The report acknowledges shortcomings without offering practical remedies.' This suggests the report ___ .", "identifies problems but does not propose solutions", "is entirely unhelpful to readers", "is optimistic about the future", "dismisses the problems as minor"},
                {"'The author's tone is measured and dispassionate.' 'Dispassionate' means ___ .", "not influenced by strong personal feelings", "extremely emotional", "difficult to understand", "deliberately provocative"},
                {"'The two studies reach opposing conclusions despite using similar data.' This implies ___ .", "data interpretation, not data collection, explains the difference", "one study must be incorrect", "similar data always produces similar results", "the data itself is unreliable"},
                {"'The policy, however well-intentioned, failed to address structural inequality.' What does 'however well-intentioned' acknowledge?", "that the policy was designed with good aims", "that the policy succeeded in its goals", "that the policy was widely criticised", "that good intentions always lead to good results"},
                {"'She was not unaware of the risks.' This sentence uses ___ .", "double negation for understatement", "a factual claim about her ignorance", "a straightforward statement of awareness", "a contradiction in the author's reasoning"},
                {"'The government's response was characterised by a reluctance to commit.' This suggests ___ .", "officials were unwilling to make firm decisions", "the response was swift and decisive", "officials disagreed publicly on the issue", "the government acted without enough information"},
                {"'Critics have long argued that short-term thinking undermines long-term policy.' 'Have long argued' suggests ___ .", "this is an established view, not a new one", "critics recently changed their opinion", "the argument has never been tested", "the view is held by a minority"},
                {"'The article raises more questions than it answers.' This implies ___ .", "it explores complexity rather than offering definitive conclusions", "it is poorly written and unclear", "it is too academic for general readers", "it reaches a clear and definitive conclusion"},
                {"'The data must be contextualised within the broader socioeconomic climate.' 'Contextualised' means ___ .", "interpreted with reference to surrounding conditions", "collected more carefully", "tested for statistical accuracy", "made publicly available"},
                {"'While the reforms were praised by some, they were met with scepticism by others.' The overall picture is ___ .", "a divided reaction, neither wholly positive nor negative", "overwhelmingly positive", "overwhelmingly negative", "unclear, with no strong reactions"},
                {"'The author concedes that the theory has limitations.' To 'concede' here means to ___ .", "admit something despite disagreeing overall", "reject an idea completely", "argue strongly in favour of the idea", "refuse to engage with criticism"},
                {"'Technological advances have outpaced the regulatory frameworks designed to govern them.' This implies ___ .", "rules and laws have not kept up with new technology", "technology has slowed due to regulation", "regulators have successfully adapted", "the two are developing at the same pace"},
                {"'The study was replicated in three different contexts with consistent results.' This detail is used to ___ .", "demonstrate the reliability and validity of the findings", "explain why the study took so long", "identify gaps for future research", "suggest that conditions vary widely"},
                {"'The researcher calls for a nuanced approach rather than a blanket policy.' 'Blanket policy' refers to ___ .", "a single rule applied uniformly regardless of context", "an overly complicated set of regulations", "a policy developed with expert input", "a temporary measure pending further research"},
                {"'Her account is compelling but not entirely corroborated by the documentary evidence.' This suggests ___ .", "her story is persuasive but lacks full factual support", "the documents prove her account is false", "all evidence supports her version", "documents are always more reliable than personal accounts"},
                {"'The text assumes a degree of familiarity with the subject on the part of the reader.' This implies ___ .", "the writing is aimed at an informed audience", "the text is difficult because it is poorly written", "the author expects all readers to agree", "background knowledge is explicitly provided"},
                {"'The argument gains credibility through the precision of its evidence rather than the passion of its rhetoric.' This sentence values ___ .", "specific facts and data over emotional persuasion", "enthusiastic language over factual accuracy", "both emotion and evidence equally", "neither evidence nor passion, but clarity of structure"},
                {"'Despite extensive media coverage, public understanding of the issue remained limited.' The contrast here is between ___ .", "the amount of information available and how well it was understood", "what the media said and what the government did", "expert opinion and popular belief", "initial reaction and later understanding"},
                {"'The initiative was piloted in three cities before being rolled out nationally.' 'Piloted' means ___ .", "tested on a small scale first", "launched everywhere simultaneously", "funded by private companies", "cancelled after one year"},
                {"'The author draws on a wide range of sources to support their argument.' This suggests the argument is ___ .", "well-researched and broad in scope", "based on personal experience only", "focused on a single narrow perspective", "difficult to follow without expert knowledge"},
            };
            case C2 -> new String[][]{
                {"'The report's conclusions are predicated on the assumption that market conditions remain stable.' What does 'predicated on' mean?", "dependent upon or based on", "contradicted by", "unrelated to", "tested against"},
                {"The phrase 'it could be argued that' signals ___ .", "a view held with some distance or reservation", "an absolute certainty", "the author's own strong personal opinion", "an empirical finding"},
                {"'Her prose oscillates between lyrical introspection and biting social critique.' The author is saying ___ .", "the writing shifts between personal reflection and social commentary", "the writing is consistently light and humorous", "the writer lacks a clear voice", "the style is mainly factual and academic"},
                {"'The policy was ostensibly designed to help workers, yet its practical effects tell a different story.' 'Ostensibly' implies ___ .", "the stated purpose may not reflect reality", "the policy clearly achieved its goals", "the workers designed the policy themselves", "the effects were immediately obvious"},
                {"'Scholars remain divided as to whether the text constitutes satire or sincere advocacy.' This sentence implies ___ .", "the text's genre and intent are genuinely ambiguous", "all scholars agree it is satire", "the text has no scholarly value", "the author's identity is unknown"},
                {"'The study's methodology is not without its critics.' This phrase is an example of ___ .", "litotes — understatement using negation", "hyperbole — deliberate exaggeration", "a rhetorical question", "a direct factual claim"},
                {"'While the findings are compelling, one must be wary of overgeneralisation.' The author's overall stance is ___ .", "cautiously positive but intellectually measured", "completely sceptical of the findings", "unconditionally enthusiastic", "dismissive of the entire research area"},
                {"'The committee's silence on the matter was, in itself, a form of endorsement.' This sentence argues that ___ .", "inaction can communicate implicit approval", "the committee explicitly approved the proposal", "silence is always ambiguous in politics", "the committee was unaware of the issue"},
                {"'The text employs an unreliable narrator, which problematises straightforward readings.' This means ___ .", "the narrator cannot be fully trusted, complicating interpretation", "the narrator makes many grammatical errors", "the text is easy to misread without context", "the narrator is fictional and therefore unimportant"},
                {"'The author's use of irony serves to distance the reader from the protagonist.' This suggests ___ .", "the writing technique creates critical detachment rather than sympathy", "the reader is meant to feel very close to the protagonist", "the author dislikes the protagonist personally", "irony is used to make the text humorous"},
                {"'One might argue, with some justification, that the reforms were cosmetic rather than structural.' The phrase 'with some justification' indicates ___ .", "the argument has some merit but is not conclusive", "the argument is completely correct", "the argument is completely wrong", "the author is unsure of their own position"},
                {"'The text foregrounds the tension between individual agency and systemic constraint.' 'Foregrounds' means ___ .", "makes the central and most prominent element", "hides in the background", "briefly mentions in passing", "resolves at the end"},
                {"'The data, though extensive, does not in itself resolve the question.' What does this tell us?", "More data alone cannot answer the underlying question", "The question has already been resolved", "The data is insufficient for any conclusions", "The question is unimportant"},
                {"'She navigates the novel's moral ambiguity with considerable dexterity.' 'Dexterity' in this context means ___ .", "skill and adaptability in handling complexity", "physical speed and agility", "strict adherence to moral rules", "avoidance of difficult themes"},
                {"'The argument is circular — it uses its own conclusion as a premise.' A circular argument is ___ .", "logically flawed because it assumes what it claims to prove", "valid because it is self-consistent", "difficult to follow because it is too complex", "acceptable in informal but not formal writing"},
                {"'His tone throughout the speech was conciliatory.' 'Conciliatory' means ___ .", "attempting to reduce conflict and make peace", "strongly confrontational and aggressive", "neutral and detached", "enthusiastic and energetic"},
                {"'The evidence is circumstantial at best.' This means the evidence ___ .", "suggests but does not prove the conclusion", "definitively proves the conclusion", "is completely irrelevant", "has been falsified"},
                {"'The narrative subtly endorses the hegemonic values it superficially critiques.' This sentence claims ___ .", "the text supports dominant values even while appearing to challenge them", "the text is a powerful critique of mainstream society", "the narrative is entirely inconsistent", "the author is unaware of their own contradictions"},
                {"'The author deliberately subverts reader expectations at every turn.' 'Subverts' means ___ .", "undermines or overturns in an unexpected way", "fulfils in a satisfying way", "confirms and reinforces", "avoids entirely"},
                {"'The policy debate is characterised by a false dichotomy.' A false dichotomy presents ___ .", "only two options when more actually exist", "two options that are equally valid", "facts instead of opinions", "a clear and correct choice between two positions"},
            };
        };
        String[] r = rows[v % rows.length];
        return make(level, QuizQuestionType.READING, "[" + level + "] " + r[0], r[1], r[2], r[3], r[4], 0);
    }

    // ═══════════════════════════ IDIOMS ═══════════════════════════

    private static Quiz idioms(Level level, int v) {
        String[][] rows = switch (level) {
            case A1, A2 -> new String[][]{
                {"'Break the ice' usually means to ___ .", "start a friendly conversation", "destroy something cold", "feel very cold", "win a game"},
                {"'Once in a blue moon' means ___ .", "very rarely", "every night", "tomorrow morning", "at sunrise"},
                {"'Piece of cake' means something is ___ .", "very easy", "delicious", "expensive", "broken"},
                {"'Hit the books' means to ___ .", "study hard", "throw books away", "buy new books", "write a novel"},
                {"'Under the weather' means feeling ___ .", "slightly ill", "very excited", "extremely angry", "very wealthy"},
                {"'Let the cat out of the bag' means to ___ .", "reveal a secret", "buy a new pet", "go to the market", "fall asleep"},
                {"'Cost an arm and a leg' means something is ___ .", "very expensive", "very painful", "very large", "very rare"},
                {"'You're pulling my leg!' means ___ .", "You're joking with me", "You're hurting me", "You're asking me to move", "You're complimenting me"},
                {"'Keep an eye on' something means to ___ .", "watch or monitor it carefully", "ignore it completely", "cover it up", "throw it away"},
                {"'Hit the sack' means to ___ .", "go to bed", "start working", "eat a meal", "go for a walk"},
                {"'It's raining cats and dogs.' This means ___ .", "It is raining very heavily", "It is raining a little", "Animals are falling from the sky", "It is very sunny"},
                {"'Get up on the wrong side of the bed' means ___ .", "be in a bad mood from the start of the day", "fall out of bed in the morning", "be late for school", "have a bad dream"},
                {"'Call it a day' means to ___ .", "stop doing something for the rest of the day", "name a specific day", "plan something for today", "celebrate a special day"},
                {"'Bite the hand that feeds you' means to ___ .", "be ungrateful to someone who helps you", "be too hungry to wait", "hurt someone by accident", "feed a dangerous animal"},
                {"'No pain, no gain' means ___ .", "you must work hard to achieve something", "pain is always bad", "everything comes easily if you try", "success brings no happiness"},
                {"'The ball is in your court' means ___ .", "It is your turn to make a decision", "You lost the game", "You must play sport today", "You are responsible for the problem"},
                {"'Kick the bucket' is an informal phrase meaning to ___ .", "die", "lose your job", "fall over", "give up"},
                {"'Go back to square one' means ___ .", "start completely from the beginning again", "return to the first question", "move backwards in a game", "revisit an old decision"},
                {"'In hot water' describes someone who is ___ .", "in trouble or facing difficulties", "working very hard", "taking a bath", "feeling very warm"},
                {"'Bite the bullet' means to ___ .", "endure a painful situation bravely", "speak very directly", "eat something quickly", "fight back against a problem"},
            };
            case B1 -> new String[][]{
                {"'To burn bridges' means to ___ .", "permanently damage a relationship or opportunity", "build something with fire", "solve a problem quickly", "cross a difficult challenge"},
                {"'On the fence' describes someone who ___ .", "has not decided between two options", "is enthusiastic about both sides equally", "is clearly in favour of one option", "refuses to discuss the topic"},
                {"'To cut corners' means to ___ .", "do something poorly to save time or money", "work with exceptional precision", "finish a task ahead of schedule", "make a sharp turn while driving"},
                {"'The ball is in your court' means ___ .", "it is now your responsibility to act or decide", "the game has already ended", "you won the argument completely", "someone else must make the decision"},
                {"'To sit on the fence' means to ___ .", "avoid committing to a position in a debate", "rest during a difficult hike", "stay out of a physical fight", "wait for results before celebrating"},
                {"'To go back to the drawing board' means ___ .", "to start a plan again from scratch", "to return to art class", "to fix a small mistake", "to review notes before an exam"},
                {"'A blessing in disguise' is something that ___ .", "seems bad at first but turns out to be good", "is obviously wonderful from the start", "harms you in the short and long term", "you receive as an unexpected gift"},
                {"'Bite the bullet' means to ___ .", "endure a painful situation with determination", "avoid a problem at all costs", "argue aggressively with someone", "give up on a difficult task"},
                {"'Burn the midnight oil' means to ___ .", "work or study late into the night", "use too much electricity", "cook a meal very late", "stay awake because you are anxious"},
                {"'Have a lot on your plate' means you are ___ .", "very busy with many tasks or problems", "eating a large meal", "working with food professionally", "planning a dinner party"},
                {"'Put all your eggs in one basket' means to ___ .", "rely on only one plan and risk everything on it", "keep everything organised in one place", "invest carefully in multiple areas", "save money for the future"},
                {"'Read between the lines' means to ___ .", "understand what is not explicitly stated", "read a text very carefully", "look for mistakes in a document", "skim-read a document quickly"},
                {"'Turn a blind eye to' means to ___ .", "deliberately ignore something wrong", "refuse to look at something unpleasant", "fail to notice something obvious", "pretend to be blind"},
                {"'See eye to eye' means to ___ .", "agree with someone completely", "look at something together", "argue strongly with someone", "meet someone for the first time"},
                {"'The tip of the iceberg' refers to ___ .", "a small visible part of a much larger problem", "the most important part of an issue", "the final stage of a long process", "a cold and remote place"},
                {"'Throw someone under the bus' means to ___ .", "blame someone else to avoid responsibility", "help someone in a dangerous situation", "accuse someone falsely in public", "drive recklessly and endanger others"},
                {"'Play devil's advocate' means to ___ .", "argue a position you don't personally hold, for discussion", "argue very aggressively in a debate", "support the weaker side in a dispute", "act dishonestly in a negotiation"},
                {"'Let sleeping dogs lie' means to ___ .", "avoid raising a past issue that could cause trouble", "be kind to animals", "be very quiet and calm", "accept a bad situation and move on"},
                {"'A dark horse' is someone who ___ .", "is unknown but has surprising talent or potential", "always loses in competitions", "is very shy and quiet by nature", "competes dishonestly"},
                {"'Miss the boat' means to ___ .", "lose an opportunity by acting too slowly", "arrive late to a sailing event", "make a navigational error", "fail to understand a situation"},
            };
            case B2 -> new String[][]{
                {"'To keep something under wraps' means to ___ .", "keep it secret", "protect it carefully", "delay it indefinitely", "review it thoroughly"},
                {"'To bite off more than you can chew' means to ___ .", "take on more than you can handle", "eat too quickly", "make an overconfident prediction", "argue with someone stronger than you"},
                {"'To be in the same boat' means to ___ .", "be in the same difficult situation as others", "agree with someone on every point", "travel together to the same destination", "share the same job or role"},
                {"'To draw a blank' means to ___ .", "fail to remember or find something", "produce no results at all", "create something original", "refuse to answer a question"},
                {"'To jump to conclusions' means to ___ .", "make a judgement too quickly without enough information", "arrive at an event before others", "solve a problem faster than expected", "take a risk in a difficult situation"},
                {"'To get the ball rolling' means to ___ .", "start a process or activity", "take control of a situation", "overcome an obstacle", "make something move faster"},
                {"'Actions speak louder than words' means ___ .", "what you do matters more than what you say", "loud behaviour is more effective than quiet talk", "speaking publicly has greater impact than acting privately", "you should always follow through on what you say"},
                {"'To be ahead of the curve' means to ___ .", "be more advanced or innovative than others", "be faster than expected", "be fully prepared for something", "be in the lead during a competition"},
                {"'To keep your cards close to your chest' means to ___ .", "not reveal your plans or intentions", "be very careful with your belongings", "work very independently", "stay focused and not get distracted"},
                {"'To get the hang of something' means to ___ .", "learn how to do it after some practice", "become frustrated by something difficult", "give up after trying many times", "understand a topic at a theoretical level"},
                {"'To make ends meet' means to ___ .", "have just enough money to cover your basic needs", "reach a compromise between two opposing views", "finish a project just before the deadline", "successfully balance two different jobs"},
                {"'To go the extra mile' means to ___ .", "make more effort than what is required", "travel a long distance unnecessarily", "exceed your physical limits", "take a longer but safer route"},
                {"'A shot in the dark' is ___ .", "a guess made without much information", "a sudden and unexpected decision", "a very risky physical action", "a comment made to shock people"},
                {"'To have the upper hand' means to ___ .", "be in a position of advantage or control", "physically overpower someone", "finish a task before someone else", "be more experienced than others"},
                {"'To be on the same page' means to ___ .", "share the same understanding or plan", "read the same document or text", "have the same educational background", "work in the same team or department"},
                {"'To weather the storm' means to ___ .", "successfully get through a difficult period", "continue working despite bad weather", "complain about unfair conditions", "ignore problems and hope they go away"},
                {"'To pull strings' means to ___ .", "use personal influence or contacts to achieve something", "create tension between two people", "do the most difficult part of a task", "manipulate someone into doing something"},
                {"'To be in the dark' means to ___ .", "not know about something important", "be in a very negative situation", "avoid making a decision", "work in very difficult conditions"},
                {"'To stand your ground' means to ___ .", "refuse to change your position or opinion", "defend yourself physically", "wait for someone to act first", "remain in a specific place"},
                {"'To cut to the chase' means to ___ .", "get to the most important point quickly", "stop working and take a break", "make a final decision quickly", "avoid a difficult subject entirely"},
            };
            case C1 -> new String[][]{
                {"'To throw caution to the wind' means to ___ .", "act recklessly without worrying about risks", "be extremely careful in everything you do", "give advice that nobody follows", "ignore criticism from others"},
                {"'To keep someone in the loop' means to ___ .", "regularly update someone with information", "exclude someone from important meetings", "confuse someone deliberately", "prevent someone from accessing information"},
                {"'To pass the buck' means to ___ .", "transfer responsibility to someone else", "accept blame for a mistake", "avoid making any decisions", "complete a task successfully"},
                {"'To be on thin ice' means to ___ .", "be in a risky or precarious situation", "have very little time remaining", "feel socially uncomfortable", "be working under excessive pressure"},
                {"'To move the goalposts' means to ___ .", "change the rules or expectations unfairly during a process", "abandon a project midway through", "celebrate achieving a target", "set new and more ambitious targets"},
                {"'The benefit of the doubt' refers to ___ .", "choosing the more favourable interpretation in an uncertain situation", "proving someone's innocence in court", "giving someone a second chance after a mistake", "admitting that both sides could be right"},
                {"'To face the music' means to ___ .", "accept the unpleasant consequences of your actions", "perform in front of a large audience", "confront someone about a difficult issue", "listen to feedback without reacting"},
                {"'To beat around the bush' means to ___ .", "avoid getting to the main point", "work very hard at an unpleasant task", "explore all options before deciding", "give someone bad news slowly and carefully"},
                {"'To be in the pipeline' means to ___ .", "be planned or in progress but not yet completed", "be permanently cancelled", "be kept secret from the public", "be under consideration but unlikely to happen"},
                {"'To take the bull by the horns' means to ___ .", "deal with a difficult problem directly and decisively", "exaggerate the difficulty of a situation", "refuse to acknowledge a serious problem", "wait for someone else to act first"},
                {"'To be up in the air' means something is ___ .", "uncertain and not yet decided", "rising in popularity", "generating great excitement", "beyond anyone's control"},
                {"'To lay your cards on the table' means to ___ .", "be completely open and honest about your intentions", "take a calculated risk in a negotiation", "hold back your best arguments", "reveal a weakness in your position"},
                {"'A steep learning curve' describes a situation where ___ .", "a great deal must be learned very quickly", "progress is slow and discouraging", "skills are acquired gradually over a long time", "the task becomes easier as you continue"},
                {"'To put your foot down' means to ___ .", "firmly insist on something or refuse to accept a situation", "make a mistake with serious consequences", "take the first step in a new direction", "act more slowly and carefully"},
                {"'To be caught red-handed' means to ___ .", "be found in the act of doing something wrong", "be falsely accused of a crime", "be embarrassed in a social situation", "be recognised unexpectedly in public"},
                {"'To cut someone some slack' means to ___ .", "be less critical or demanding of someone", "dismiss someone from a position", "allow someone to make their own mistakes freely", "reduce someone's workload permanently"},
                {"'To go against the grain' means to ___ .", "act contrary to what is normal or expected", "make progress very slowly", "go along with the majority opinion", "fail despite considerable effort"},
                {"'To hit the nail on the head' means to ___ .", "describe or identify something exactly and correctly", "make a small but important mistake", "reach an agreement after long negotiation", "solve a problem with minimal effort"},
                {"'To ring a bell' means to ___ .", "sound or seem familiar", "cause a problem or alert", "attract someone's attention", "start a formal meeting"},
                {"'To stand your ground' means to ___ .", "refuse to change your position or opinion", "defend yourself physically", "wait for someone else to act first", "remain in a specific place"},
            };
            case C2 -> new String[][]{
                {"'To split hairs' means to ___ .", "argue about trivial or extremely small distinctions", "divide tasks fairly", "make a hasty and poorly considered decision", "fail to see the most important point"},
                {"A 'double-edged sword' describes something that ___ .", "has both clear advantages and clear disadvantages", "is extremely powerful in all situations", "can only be used once effectively", "is completely harmless"},
                {"'To take something with a grain of salt' means to ___ .", "accept it with healthy scepticism", "trust it completely and without question", "reject it outright as false", "preserve it carefully for later use"},
                {"'Carte blanche' means ___ .", "complete freedom to act however one wishes", "a formal written complaint or grievance", "a strict set of non-negotiable rules", "a very high price"},
                {"A 'Pyrrhic victory' is a win that ___ .", "comes at such great cost it is barely worth it", "brings enormous benefit to every party", "is achieved with surprisingly little effort", "completely surprises all outside observers"},
                {"'By the same token' is used to ___ .", "introduce a point that follows from the same logic", "introduce a point that completely contradicts the previous", "summarise everything that has been said", "pose a question the speaker cannot answer"},
                {"'To be hoist by your own petard' means to ___ .", "be harmed by your own scheme or plan", "succeed by an unexpected method", "be praised publicly for your courage", "be criticised unfairly by others"},
                {"'To add insult to injury' means to ___ .", "make a bad situation even worse", "simultaneously offend and physically harm someone", "apologise insincerely after an argument", "exaggerate the difficulty of a situation"},
                {"'The exception that proves the rule' suggests that ___ .", "an unusual case confirms that a general pattern normally holds", "every rule has so many exceptions it is useless", "exceptions should always override the rule", "the rule was designed with the exception in mind"},
                {"'A Gordian knot' is used to describe ___ .", "an extremely complex problem with no obvious solution", "a very tight and secure physical knot", "a decision that is easy once you know the trick", "an argument that has already been resolved"},
                {"'To pay lip service to' something means to ___ .", "express support without taking any real action", "publicly criticise something in formal language", "read a text aloud without understanding it", "make a sincere effort to change behaviour"},
                {"'The law of diminishing returns' refers to a situation where ___ .", "additional effort produces progressively smaller gains", "breaking the law leads to decreasing penalties", "each new effort produces greater results", "investment always returns a fixed profit"},
                {"'A red herring' in an argument is ___ .", "a misleading detail that distracts from the real issue", "a very strong point that wins the debate", "a factual error that undermines the argument", "an emotional appeal to the audience"},
                {"'To rest on your laurels' means to ___ .", "rely on past success without continuing to improve", "take a well-earned break after achieving a goal", "display your achievements publicly", "continue working harder than ever before"},
                {"'To put something on the back burner' means to ___ .", "set it aside as a lower priority for now", "abandon it permanently", "deal with it as an emergency", "discuss it privately with others"},
                {"'The elephant in the room' is ___ .", "an obvious problem that everyone avoids discussing", "a very large and expensive project", "the most important topic in a discussion", "a difficult person in a meeting"},
                {"'A Catch-22' refers to ___ .", "an impossible situation where contradictory rules trap you", "a difficult but solvable problem", "a decision that is both obvious and wrong", "a formal contract with many conditions"},
                {"'To have an axe to grind' means to ___ .", "have a personal motive or grievance behind your actions", "work very hard at a physical task", "argue persistently about a minor point", "seek revenge for a past injustice"},
                {"'To stand on ceremony' means to ___ .", "insist on following formal rules and protocols", "perform at a public occasion", "wait for others to speak first", "take full credit for a shared achievement"},
                {"'In the fullness of time' means ___ .", "eventually, when the right moment comes", "immediately and without delay", "never, under any circumstances", "as quickly as possible"},
            };
        };
        String[] r = rows[v % rows.length];
        return make(level, QuizQuestionType.IDIOMS, "[" + level + "] " + r[0], r[1], r[2], r[3], r[4], 0);
    }

    // ═══════════════════════════ UTIL ═══════════════════════════

    private static Quiz make(Level level, QuizQuestionType type,
                             String prompt, String a, String b, String c, String d,
                             int correct) {
        Quiz q = new Quiz();
        q.setLevel(level);
        q.setQuestionType(type);
        q.setPrompt(trim(prompt, 500));
        q.setOptA(trim(a, 200));
        q.setOptB(trim(b, 200));
        q.setOptC(trim(c, 200));
        q.setOptD(trim(d, 200));
        q.setCorrectIndex(Math.floorMod(correct, 4));
        return q;
    }

    private static String trim(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max - 1);
    }
}
