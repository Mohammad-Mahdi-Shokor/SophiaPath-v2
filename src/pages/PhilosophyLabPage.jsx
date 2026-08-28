import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  Avatar,
  Grid,
  Divider,
  LinearProgress,
  TextField,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  MenuBook as BookIcon,
  HelpOutline as HelpOutlineIcon,
  Timeline as TimelineIcon,
  PlayArrow as PlayIcon,
  AutoAwesome as AutoAwesomeIcon,
  Explore as ExploreIcon,
  Psychology as PsychologyIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  AccountTree as AccountTreeIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import './LearningContentPage.css'; // Reuses existing glassmorphic page styles
import { ReligionTreeMap } from '../components/ReligionTreeMap';
import SocratesAvatar from '../components/SocratesAvatar';
import BiggerScreenRequired from '../components/BiggerScreenRequired';
import logoImg from '../assets/sp-logo.png';

// 1. Upgraded Socratic Dialogue Widget (AI Chat Only)
export const SocraticDialogueWidget = () => {
  const [messages, setMessages] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioRef = useRef(null);
  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiLoading]);

  const handleSendCustomMessage = async (e) => {
    if (e) e.preventDefault();
    if (!customInput.trim() || aiLoading) return;

    const userText = customInput.trim();
    setCustomInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setAiLoading(true);
    setIsTalking(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const res = await fetch('/ai/socrates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages,
          generateVoice: audioEnabled
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'socrates', text: data.reply }]);

        if (data.audio) {
          const audioObj = new Audio(data.audio);
          audioRef.current = audioObj;
          
          // Animate only after the audio starts playing
          audioObj.onplaying = () => {
            setIsTalking(true);
          };
          
          audioObj.play().catch(err => {
            console.error('Audio play failed:', err);
            // Fallback: start animation immediately if audio fails to load/play
            setIsTalking(true);
            const duration = Math.min(Math.max(data.reply.length * 50, 2000), 8000);
            setTimeout(() => setIsTalking(false), duration);
          });
          
          audioObj.onended = () => setIsTalking(false);
        } else {
          // No audio: animate mouth for a readable duration based on text length
          setIsTalking(true);
          const duration = Math.min(Math.max(data.reply.length * 50, 2000), 8000);
          setTimeout(() => setIsTalking(false), duration);
        }

        if (data.audioError) {
          console.warn('Socratic Voice Error:', data.audioError);
          setMessages(prev => [
            ...prev,
            { sender: 'system-error', text: `Voice failed: ${data.audioError}` }
          ]);
        }
      } else {
        setMessages(prev => [
          ...prev,
          { sender: 'socrates', text: 'Alas, my thoughts are clouded by a network disturbance. Please try asking again.' }
        ]);
        setIsTalking(true);
        setTimeout(() => setIsTalking(false), 3000);
      }
    } catch (err) {
      console.error('AI Socrates error:', err);
      setMessages(prev => [
        ...prev,
        { sender: 'socrates', text: 'It seems the digital medium fails us. Let us attempt to speak again shortly.' }
      ]);
      setIsTalking(true);
      setTimeout(() => setIsTalking(false), 3000);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Paper className="glass-panel" style={{
      padding: '0',
      margin: '20px 0',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden'}}>
      {/* ── Flex container for Socrates (left) and Chat (right) ── */}
      <Box style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}>
        
        {/* Left: Socrates stage */}
        <Box style={{
          width: '450px',
          flexShrink: 0,
          background: 'linear-gradient(180deg, rgba(49, 35, 56, 0.95) 0%, rgba(22, 19, 24, 0.98) 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          position: 'relative',
          overflow: 'hidden',
          paddingBottom: '20px'
        }}>
          {/* Decorative columns */}
          <Box style={{ position: 'absolute', left: 0, bottom: 0, top: 0, width: '10px', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.04)' }} />
          <Box style={{ position: 'absolute', right: 0, bottom: 0, top: 0, width: '10px', background: 'rgba(255,255,255,0.02)', borderLeft: '1px solid rgba(255,255,255,0.04)' }} />

          {/* Name badge */}
          <Box style={{
            position: 'absolute',
            top: 14,
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }}>
            <Box style={{
              background: 'rgba(213,164,41,0.1)',
              border: '1px solid rgba(213,164,41,0.2)',
              borderRadius: '12px',
              padding: '3px 10px',
              fontSize: '0.65rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#D5A429'
            }}>
              ✦ Socrates
            </Box>
          </Box>

          {/* Socrates Avatar SVG stage */}
          <Box style={{ width: '100%', height: '520px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <SocratesAvatar isTalking={isTalking} aiLoading={aiLoading} size="stretch" />
          </Box>

          {/* Status Indicator */}
          <Box style={{
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.7rem',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            zIndex: 2
          }}>
            {aiLoading ? (
              <><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#FF9F43', animation: 'pulse 1s infinite' }} /> Contemplating...</>
            ) : isTalking ? (
              <><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#3DDC97' }} /> Speaking</>
            ) : (
              <><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--text-disabled)' }} /> Awaiting question</>
            )}
          </Box>
        </Box>

        {/* Right: Socratic dialogue simulator controls + chat */}
        <Box style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Header row */}
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <Box>
              <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Socratic Dialogue Simulator</Typography>
              <Typography variant="caption" style={{ color: 'var(--text-secondary)' }}>Dialogue on Philosophical Definitions</Typography>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={audioEnabled}
                  onChange={(e) => {
                    setAudioEnabled(e.target.checked);
                    if (!e.target.checked && audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current = null;
                      setIsTalking(false);
                    }
                  }}
                  color="primary"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--primary-main)' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'var(--primary-main)' }
                  }}
                />
              }
              label={
                <Box style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                  {audioEnabled ? <VolumeUpIcon sx={{ fontSize: 18, color: 'var(--primary-main)' }} /> : <VolumeOffIcon sx={{ fontSize: 18, color: 'var(--text-secondary)' }} />}
                  <Typography variant="caption" style={{ fontWeight: 800, fontSize: '0.75rem' }}>
                    {audioEnabled ? 'Voice On' : 'Voice Off'}
                  </Typography>
                </Box>
              }
            />
          </Box>

          {/* Chat log */}
          <Box style={{ minHeight: '280px', maxHeight: '520px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', marginBottom: '14px' }}>
            {messages.length === 0 ? (
              <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '120px', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.88rem' }}>
                The Socratic dialogue is quiet. Propose a definition to begin...
              </Box>
            ) : (
              messages.map((msg, i) => {
                const isSystemError = msg.sender === 'system-error';
                return (
                  <Box key={i} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    <Box style={{
                      maxWidth: '85%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      fontSize: '0.84rem',
                      lineHeight: 1.4,
                      backgroundColor: isSystemError ? 'rgba(244, 67, 54, 0.08)' : (msg.sender === 'user' ? 'rgba(28, 176, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)'),
                      border: isSystemError ? '1px solid rgba(244, 67, 54, 0.3)' : (msg.sender === 'user' ? '1px solid rgba(28, 176, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)'),
                      color: isSystemError ? '#f44336' : 'var(--text-primary)'
                    }}>
                      <Typography variant="caption" style={{ display: 'block', fontWeight: 800, color: isSystemError ? '#f44336' : (msg.sender === 'user' ? '#1CB0F6' : 'var(--primary-main)'), marginBottom: '2px', textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.05em' }}>
                        {isSystemError ? 'System Notice' : (msg.sender === 'user' ? 'You' : 'Socrates')}
                      </Typography>
                      {msg.text}
                    </Box>
                  </Box>
                );
              })
            )}
            {aiLoading && (
              <Box style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Box style={{ padding: '10px 14px', borderRadius: '12px', fontSize: '0.84rem', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  Socrates is contemplating...
                </Box>
              </Box>
            )}
            <div ref={chatEndRef} />
          </Box>

          {/* Input form */}
          <form onSubmit={handleSendCustomMessage} style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
            <TextField
              fullWidth
              size="small"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Propose a definition or ask Socrates a question..."
              disabled={aiLoading}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'var(--text-primary)',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.01)',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                  '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' }}
              }}
            />
            <Button
              type="submit"
              disabled={aiLoading || !customInput.trim()}
              variant="contained"
              style={{ borderRadius: '10px', textTransform: 'none', fontWeight: 800, padding: '0 20px', background: 'var(--primary-main)', color: '#fff', whiteSpace: 'nowrap' }}
            >
              Ask
            </Button>
          </form>
        </Box>

      </Box>
    </Paper>
  );
};

// 3. Fallacy Matcher Widget
// 3. Fallacy Encyclopedia & Quiz Widget
const FALLACIES_DATABASE = [
  { name: "Ad hominem", desc: "Attacking the opponent's character instead of their argument.", ex: "Don't listen to his economic plan; he was fired from his last job." },
  { name: "Abusive ad hominem", desc: "Directly insulting the opponent to discredit them.", ex: "Her proposal is ridiculous because she is a known liar and a fool." },
  { name: "Circumstantial ad hominem", desc: "Arguing that the opponent's position is motivated by their personal circumstances.", ex: "Of course the car salesman says we need a new car; he gets a commission." },
  { name: "Tu quoque", desc: "Claiming an argument is invalid because the speaker's own actions don't align with it.", ex: "You tell me to eat healthy, but yesterday I saw you eating a double cheeseburger." },
  { name: "Poisoning the well", desc: "Presenting adverse information about an opponent beforehand to discredit anything they say.", ex: "Before my opponent takes the stage, keep in mind he has a history of cheating." },
  { name: "Genetic fallacy", desc: "Judging an argument based solely on its origin rather than its current merit.", ex: "This idea comes from a fringe website, so it must be completely false." },
  { name: "Straw man", desc: "Misrepresenting or exaggerating an opponent's argument to make it easier to attack.", ex: "She wants to reduce defense spending, so she wants our country to be completely defenseless!" },
  { name: "Weak man", desc: "Attacking the weakest or easiest-to-refute version of an opponent's arguments.", ex: "Some people oppose the project because of the color of the signs; that's a silly reason." },
  { name: "Steel man", desc: "Representing the opponent's argument in its strongest, most logical form before addressing it.", ex: "Let's assume the proposed policy aims to prevent fraud in the most efficient way..." },
  { name: "Red herring", desc: "Introducing an irrelevant topic to divert attention from the original issue.", ex: "Why worry about the environment when we have so many unemployed people?" },
  { name: "False dilemma", desc: "Presenting only two options when multiple alternatives exist.", ex: "Either we build a new highway, or the city's economy will collapse." },
  { name: "False dichotomy", desc: "Dividing a spectrum of options into two mutually exclusive choices.", ex: "You're either a hard worker who supports this, or you are lazy and oppose it." },
  { name: "False trilemma", desc: "Presenting only three options when more options exist.", ex: "A leader is either a hero, a villain, or a coward." },
  { name: "Slippery slope", desc: "Claiming a relatively small step will inevitably lead to a chain of drastic, negative events.", ex: "If we ban plastic straws, they will eventually ban all plastics and destroy the economy." },
  { name: "Hasty generalization", desc: "Drawing a broad conclusion from a very small or unrepresentative sample size.", ex: "My two friends didn't like the movie, so it must be a flop." },
  { name: "Overgeneralization", desc: "Applying a general rule too broadly or to cases where it does not fit.", ex: "All birds can fly, so this penguin must be able to fly too." },
  { name: "Cherry picking", desc: "Selecting only data that supports one's position while ignoring contradictory evidence.", ex: "This study showed a benefit in two people, ignoring the 98 others who had no change." },
  { name: "Texas sharpshooter", desc: "Clustering data points together to create a pattern where none exists.", ex: "He shot at the wall, then drew a bullseye around the cluster of bullet holes." },
  { name: "Confirmation bias", desc: "Favoring information that confirms existing beliefs while ignoring disconfirming facts.", ex: "I only read news articles that agree with my political views." },
  { name: "Anecdotal fallacy", desc: "Using a personal story or isolated example instead of a sound argument or statistics.", ex: "Smoking isn't bad for you; my grandfather smoked daily and lived to be 95." },
  { name: "Appeal to emotion", desc: "Manipulating emotions to win an argument in the absence of factual evidence.", ex: "Think of the poor children who will suffer if we don't pass this tax." },
  { name: "Appeal to fear", desc: "Using fear or scare tactics to influence an audience's opinion.", ex: "If we don't elect her, crime rates will skyrocket and destroy our neighborhoods." },
  { name: "Appeal to pity", desc: "Exploiting feelings of pity or guilt to gain support for an argument.", ex: "I deserve a passing grade because I worked night shifts and slept very little." },
  { name: "Appeal to ridicule", desc: "Presenting the opponent's argument in a mocking or ridiculous way to make it look foolish.", ex: "He thinks humans evolved from rocks! How absurd is that?" },
  { name: "Appeal to spite", desc: "Dismissing a claim out of malice or spite toward the person making it.", ex: "Why support his charity? He didn't invite us to his party last year." },
  { name: "Appeal to flattery", desc: "Using praise or flattery to gain agreement with a claim.", ex: "An intelligent person like you will easily see that my proposal is correct." },
  { name: "Appeal to consequences", desc: "Arguing a claim is true or false based on whether its truth leads to desirable or undesirable outcomes.", ex: "God must exist, because without Him, life would have no meaning." },
  { name: "Appeal to nature", desc: "Arguing that something is good because it is natural, or bad because it is unnatural.", ex: "Herbal medicine is always better because it comes directly from the earth." },
  { name: "Appeal to tradition", desc: "Arguing that a practice is correct simply because it has been done that way for a long time.", ex: "We must keep this voting system because we have used it for two centuries." },
  { name: "Appeal to novelty", desc: "Arguing that something is superior simply because it is new or modern.", ex: "This software must be better because it was released just yesterday." },
  { name: "Appeal to popularity", desc: "Arguing a claim is true because many people believe it.", ex: "Everyone is buying this stock, so it must be a safe and smart investment." },
  { name: "Bandwagon", desc: "Encouraging someone to do or believe something because 'everyone else is doing it'.", ex: "Join our movement; millions of people have already signed up!" },
  { name: "Appeal to authority", desc: "Claiming a statement is true solely because an authority figure said it.", ex: "The president said this medicine works, so it must be 100% safe." },
  { name: "False authority", desc: "Using an authority figure's opinion on a topic outside their area of expertise.", ex: "A famous actor says this diet cures cancer, so I'm going to try it." },
  { name: "Appeal to ignorance", desc: "Arguing a claim is true because it hasn't been proven false (or vice versa).", ex: "No one has proven aliens don't exist, so they must exist." },
  { name: "Burden of proof", desc: "Placing the responsibility to prove a claim on the skeptic rather than the claimant.", ex: "I believe in ghosts; if you don't, prove that they don't exist!" },
  { name: "Begging the question", desc: "An argument's premises assume the truth of the conclusion it is trying to prove.", ex: "Freedom of speech is important because people should be allowed to speak freely." },
  { name: "Circular reasoning", desc: "A reasoning path where the beginning is the same as the end.", ex: "The Bible is the word of God because God wrote it, and God wouldn't lie." },
  { name: "Loaded question", desc: "Asking a question that contains a controversial or unjustified assumption built in.", ex: "Have you stopped stealing money from your parents yet?" },
  { name: "Complex question", desc: "A question that presupposes several facts and demands a single, simple answer.", ex: "Why did you sabotage the project, and when will you resign?" },
  { name: "Equivocation", desc: "Using a word with multiple meanings in different parts of an argument to mislead.", ex: "Feathers are light. Light is not dark. Therefore, feathers are not dark." },
  { name: "Amphiboly", desc: "Using ambiguous grammatical structures to create multiple interpretations.", ex: "Save washing machine and dry yourself." },
  { name: "Accent fallacy", desc: "Changing the meaning of an argument by placing stress on specific words.", ex: "We should not speak *ill* of our friends (implying we can speak ill of others)." },
  { name: "Composition", desc: "Arguing that what is true of the parts must be true of the whole.", ex: "Each player on the team is excellent, so the team must be unbeatable." },
  { name: "Division", desc: "Arguing that what is true of the whole must be true of the parts.", ex: "The company is extremely profitable, so every employee must be rich." },
  { name: "False cause", desc: "Assuming a cause-and-effect relationship between two events without proof.", ex: "I wore my lucky socks and won the game; the socks caused the victory." },
  { name: "Post hoc ergo propter hoc", desc: "Assuming that because event B followed event A, event A caused event B.", ex: "The rooster crows right before sunrise, so the rooster causes the sun to rise." },
  { name: "Cum hoc ergo propter hoc", desc: "Assuming correlation implies causation because two events occur together.", ex: "Ice cream sales and drowning rates increase together, so ice cream causes drowning." },
  { name: "Non sequitur", desc: "A conclusion that does not logically follow from the previous arguments or premises.", ex: "She drives a red sports car, so she must be a great cook." },
  { name: "Affirming the consequent", desc: "Invalid formal argument: If A then B; B, therefore A.", ex: "If it rains, the street gets wet. The street is wet, so it must have rained." },
  { name: "Denying the antecedent", desc: "Invalid formal argument: If A then B; not A, therefore not B.", ex: "If you are a doctor, you went to college. You are not a doctor, so you didn't go to college." },
  { name: "Middle ground", desc: "Arguing that a compromise or middle position between two extremes is always correct.", ex: "One person says the sky is blue, another says it's yellow; therefore, it must be green." },
  { name: "No true Scotsman", desc: "Redefining a term to exclude counterexamples and protect a generalization.", ex: "No Scotsman puts sugar on his porridge. But Angus does! Well, no *true* Scotsman does." },
  { name: "Special pleading", desc: "Applying standards or rules to others while demanding an exception for oneself without justification.", ex: "Everyone must wait in line, but I am too busy and should go first." },
  { name: "Moving the goalposts", desc: "Changing the criteria of a challenge or argument after the opponent has met the original criteria.", ex: "You proved it works in a lab, but now you must prove it works in space." },
  { name: "Nirvana fallacy", desc: "Comparing a realistic, messy solution with an idealized, perfect alternative.", ex: "Seatbelts are useless because people still die in car crashes even while wearing them." },
  { name: "Perfect solution fallacy", desc: "Rejecting a solution because it does not solve the entire problem perfectly.", ex: "Why fund cancer research? It won't stop people from getting other diseases." },
  { name: "False analogy", desc: "Comparing two situations that are not similar enough to warrant the comparison.", ex: "Employees are like cogs in a machine; they don't need breaks or wages, just oil." },
  { name: "Faulty analogy", desc: "Drawing conclusions based on superficial similarities between two distinct things.", ex: "Medical clinics are like auto shops; both just swap out broken parts." },
  { name: "Gambler's fallacy", desc: "Believing that past random events influence the probability of future independent events.", ex: "The coin landed on heads five times in a row, so tails is 'due' on the next flip." },
  { name: "Hot hand fallacy", desc: "Believing a person who has experienced success has a greater chance of success in subsequent attempts.", ex: "He made three baskets in a row; he cannot miss his next shot." },
  { name: "Sunk cost fallacy", desc: "Continuing an endeavor because of past invested resources, even when stopping is better.", ex: "I hate this movie, but I paid $15 for the ticket, so I'm going to stay until the end." },
  { name: "Appeal to probability", desc: "Assuming that because something *can* happen, it *will* happen.", ex: "There is a minor chance of a meteor strike today, so I am staying in my bunker." },
  { name: "Appeal to wealth", desc: "Assuming someone is correct or superior because they are rich.", ex: "He is a billionaire, so his advice on parenting must be excellent." },
  { name: "Appeal to poverty", desc: "Assuming someone is correct or morally superior because they are poor.", ex: "He lives in a humble hut, so he must possess deep spiritual wisdom." },
  { name: "Appeal to force", desc: "Using threats of force or negative consequences to compel agreement.", ex: "Agree with my decision, or you will find yourself looking for another job." },
  { name: "Argument from silence", desc: "Drawing a conclusion based on the absence of statements or silence of an opponent.", ex: "He didn't reply to my email, which proves he has no defense and is guilty." },
  { name: "Argument from incredulity", desc: "Dismissing a claim because it is difficult to understand or believe.", ex: "I cannot fathom how space is curved, so Einstein's theory must be wrong." },
  { name: "Personal incredulity", desc: "Arguing that a claim is false because you personally cannot understand or explain it.", ex: "I don't see how cells evolved, so creationism must be true." },
  { name: "Appeal to motive", desc: "Challenging an argument by questioning the motives of the person proposing it.", ex: "She supports green energy only because she owns stock in solar companies." },
  { name: "Moralistic fallacy", desc: "Assuming that because something is morally undesirable, it cannot be natural or true.", ex: "War is evil, so violence cannot be part of human nature." },
  { name: "Naturalistic fallacy", desc: "Arguing that because something is natural, it must be morally good or acceptable.", ex: "Animals eat each other in nature, so it is morally right for us to eat meat." },
  { name: "Is-ought fallacy", desc: "Arguing that because things *are* a certain way, they *should* be that way.", ex: "Slavery was practiced for thousands of years, so it's a natural social order." },
  { name: "Ecological fallacy", desc: "Deducing information about an individual based solely on group-level statistics.", ex: "This city has a high crime rate; therefore, John, who lives there, must be a criminal." },
  { name: "Masked man fallacy", desc: "Invalid substitution of terms in modal logic.", ex: "I know my father. I do not know the masked man. Therefore, the masked man is not my father." },
  { name: "Undistributed middle", desc: "Formal fallacy: All A are B; C is B; therefore, C is A.", ex: "All dogs have four legs. Cats have four legs. Therefore, cats are dogs." },
  { name: "Four-term fallacy", desc: "Formal fallacy occurring in a syllogism that has four terms instead of three.", ex: "All fish swim. Some pools are fishy. Therefore, pools swim." },
  { name: "Illicit major", desc: "Formal fallacy where the major term is distributed in the conclusion but not in the major premise.", ex: "All dogs are mammals. No cats are dogs. Therefore, no cats are mammals." },
  { name: "Illicit minor", desc: "Formal fallacy where the minor term is distributed in the conclusion but not in the minor premise.", ex: "All dogs are mammals. All dogs are friendly. Therefore, all mammals are friendly." },
  { name: "Exclusive premises", desc: "Categorical syllogism that is invalid because both of its premises are negative.", ex: "No dogs are cats. No cats are fish. Therefore, no dogs are fish." },
  { name: "Existential fallacy", desc: "Syllogism that assumes a class has members when it has not been established.", ex: "All unicorns are magical. Therefore, some magical things are unicorns." },
  { name: "Accident", desc: "Applying a general rule to an exceptional case where it does not apply.", ex: "Cutting people with knives is a crime. Surgeons cut people; they are criminals." },
  { name: "Converse accident", desc: "Generalizing from an atypical, exceptional case to all cases.", ex: "Since morphine is given to patients in pain, everyone should be allowed to use it." },
  { name: "Suppressing evidence", desc: "Intentionally omitting relevant facts that contradict one's position.", ex: "Our sales doubled this month (omitting that they fell 90% the previous month)." },
  { name: "False equivalence", desc: "Arguing that two completely different things are equal or comparable.", ex: "Both rain and hurricanes are just water falling from the sky; they are the same." },
  { name: "Tokenism", desc: "Offering a superficial or symbolic gesture instead of meaningful action.", ex: "We hired one minority worker, so our company is completely diverse now." },
  { name: "Whataboutism", desc: "Responding to criticism by accusing the opponent of a similar or worse offense.", ex: "Why are you calling me out for lying? What about when you lied last year?" },
  { name: "Appeal to hypocrisy", desc: "Rejecting criticism because the critic is also guilty of the behavior.", ex: "How can you tell me to drive slower when you got a speeding ticket last week?" },
  { name: "Argument by repetition", desc: "Repeating a claim constantly instead of providing evidence for it.", ex: "I am right. I am right. As I've said before, I am absolutely right." },
  { name: "Proof by assertion", desc: "Declaring a statement is true repeatedly without proving it.", ex: "This product works. It just does. Believe me, it works." },
  { name: "Ipse dixit", desc: "A dogmatic statement of opinion presented as an established fact without proof.", ex: "It is true simply because I say it is true." },
  { name: "Appeal to common practice", desc: "Arguing a behavior is correct because 'everyone does it'.", ex: "It's fine to cheat on taxes; everyone does it to save a little cash." },
  { name: "Appeal to common belief", desc: "Claiming an idea is true because a large number of people believe it.", ex: "Most people once believed the Earth was flat, so it must have been flat." },
  { name: "Appeal to coincidence", desc: "Arguing that a clear cause-and-effect relationship is just a coincidence.", ex: "He got sick right after drinking poison, but it was just a coincidence." },
  { name: "Regression fallacy", desc: "Failing to account for natural fluctuations and attributing a change to an intervention.", ex: "I had a bad cold, drank tea, and got better. The tea cured my cold!" },
  { name: "Base rate fallacy", desc: "Ignoring general probability statistics in favor of specific, anecdotal cases.", ex: "The test is 99% accurate, but in a rare population, positive results are mostly false." },
  { name: "Availability heuristic", desc: "Overestimating the likelihood of events based on how easily they are recalled.", ex: "I saw a shark attack on the news, so I am never swimming in the ocean again." },
  { name: "Survivorship bias", desc: "Focusing on successful outcomes while ignoring failures in a data set.", ex: "He dropped out of college and became a billionaire, so college is a waste of time." },
  { name: "False balance", desc: "Presenting two opposing views as equally valid when one is overwhelmingly supported by evidence.", ex: "Giving equal broadcast time to a climate scientist and a flat-Earther." },
  { name: "Relative privation", desc: "Dismissing a problem because 'others have it worse'.", ex: "Don't complain about your broken leg; there are children starving in the world." },
  { name: "Appeal to envy", desc: "Dismissing an argument based on jealousy or envy of the opponent.", ex: "She only supports that policy because she is jealous of my success." },
  { name: "Appeal to heaven", desc: "Claiming an action is justified because it is God's will.", ex: "We were commanded by heaven to take this land, so we are justified." },
  { name: "Historian's fallacy", desc: "Judging past decisions based on information that was only available later.", ex: "They should have known the stock market would crash in 1929; it was obvious." },
  { name: "McNamara fallacy", desc: "Making decisions based solely on quantitative metrics and ignoring qualitative factors.", ex: "Our student test scores are up, so our school must be teaching beautifully." },
  { name: "Ludic fallacy", desc: "Applying simple game-like probability models to complex, unpredictable real-world situations.", ex: "The math model says this bank collapse is impossible, so we are 100% safe." },
  { name: "Fallacy of gray", desc: "Arguing that because no position is perfect, all positions are equally valid or flawed.", ex: "Both political parties have corrupt members, so they are exactly the same." },
  { name: "Continuum fallacy", desc: "Rejecting a claim because there is no clear line separating two states.", ex: "Losing one hair doesn't make you bald, so you can never truly become bald." },
  { name: "Line-drawing fallacy", desc: "Arguing that because no precise line can be drawn, no difference exists.", ex: "Since we can't define exactly when night becomes day, night and day are the same." },
  { name: "Reification", desc: "Treating an abstract concept or idea as if it were a physical, concrete thing.", ex: "Justice demanded that he be punished (treating justice as a sentient being)." },
  { name: "Hypostatization", desc: "An alternate name for reification; treating abstractions as real agents.", ex: "Nature knows exactly what is best for our bodies." },
  { name: "Category mistake", desc: "Ascribing a property to something that belongs to a completely different category.", ex: "I saw the libraries, classrooms, and students, but where is the 'University'?" },
  { name: "Package deal", desc: "Assuming that items grouped together by tradition or culture must always go together.", ex: "If you support environmental laws, you must also support tax hikes." },
  { name: "Wishful thinking", desc: "Assuming a claim is true simply because you want it to be true.", ex: "I am going to win the lottery today because I really need the money." },
  { name: "Argument from adverse consequences", desc: "Arguing a statement is false because its truth would lead to bad outcomes.", ex: "Climate change can't be real because fixing it would bankrupt my business." },
  { name: "Appeal to accomplishment", desc: "Evaluating an argument based on the credentials or success of the speaker.", ex: "Write a best-selling book first, then criticize my writing style." },
  { name: "Courtier's reply", desc: "Dismissing criticism by claiming the critic lacks deep, specialized knowledge of the subject.", ex: "You cannot criticize this religion because you haven't read all 80 volumes." },
  { name: "Bulverism", desc: "Assuming an opponent is wrong and explaining why they hold that belief, without addressing the argument.", ex: "You only say the budget needs cuts because you are a frugal accountant." },
  { name: "Psychologist's fallacy", desc: "Assuming that one's own subjective interpretations are objective facts for everyone.", ex: "I found this exam incredibly easy, so anyone who failed must be lazy." },
  { name: "Historicism", desc: "Assuming historical patterns dictate future human choices and events inevitably.", ex: "History shows empires always collapse, so our country will fall by next decade." },
  { name: "Halo effect", desc: "Letting overall positive feelings about a person influence judgments of their arguments.", ex: "He is a handsome and kind actor, so his views on nuclear physics must be right." },
  { name: "Argument from verbosity", desc: "Making an argument so incredibly long and complex that opponents cannot refute it.", ex: "This 900-page document proves my point; read it if you want to debate me." },
  { name: "Argument from personal experience", desc: "Declaring a claim is true or false based solely on one's own experiences.", ex: "I've never experienced racism, so racism does not exist in our city." },
  { name: "Appeal to luck", desc: "Attributing success or failure to luck rather than effort or skill.", ex: "She only got the promotion because she was lucky; her work had nothing to do with it." },
  { name: "Divine fallacy", desc: "Attributing a phenomenon to a supernatural cause because it is amazing or mysterious.", ex: "I don't know how this magician levitated, so it must be real magic." },
  { name: "Just-world fallacy", desc: "Assuming that the world is inherently fair and people get what they deserve.", ex: "He got scammed because he must have done something bad in his past." },
  { name: "Worldview defense", desc: "Rejecting evidence that threatens one's core beliefs to protect cognitive comfort.", ex: "I refuse to look at those fossils because they contradict my belief in creation." },
  { name: "False attribution", desc: "Attributing a quote or claim to an unreliable source, or fabricating it.", ex: "Einstein once said that reading books makes you a genius." },
  { name: "Intentional fallacy", desc: "Judging the meaning of a work of art solely by the creator's intent.", ex: "The painter meant to show joy, so this painting cannot be interpreted as sad." },
  { name: "One true cause", desc: "Attributing a complex outcome to a single, simple cause.", ex: "The fall of the empire was caused entirely by high taxes." },
  { name: "Single cause fallacy", desc: "Assuming there is only one cause for an event when multiple causes exist.", ex: "School grades fell this year solely because of screen time." },
  { name: "Oversimplification", desc: "Reducing a complex issue to a simple statement that ignores crucial details.", ex: "Solving poverty is easy: just print more money and give it to everyone." },
  { name: "Causal reductionism", desc: "Explaining an event by focusing on only one of many contributing causes.", ex: "The accident happened because the driver was tired (ignoring bad weather)." },
  { name: "Correlation implies causation", desc: "Assuming that because two variables move together, one causes the other.", ex: "Ice cream sales and sunglasses sales are correlated, so ice cream sales cause sunglasses purchases." },
  { name: "Argumentum ad baculum", desc: "An argument that relies on force or the threat of force to compel agreement.", ex: "Accept this budget proposal, or we will cut your department's funding completely." },
  { name: "Argumentum ad misericordiam", desc: "An appeal to pity or misery to win support for a claim.", ex: "Please give me a loan; my car broke down and my cat is sick." },
  { name: "Argumentum ad populum", desc: "Arguing a claim is correct because it is popular or favored by the public.", ex: "This brand is the most popular in the country, so it must be the best." },
  { name: "Argumentum ad verecundiam", desc: "An appeal to inappropriate authority or reverence for a figure.", ex: "Aristotle said heavy objects fall faster, so it must be true." },
  { name: "Argumentum ad ignorantiam", desc: "Arguing a claim is true simply because it hasn't been proven false.", ex: "No one has proven that ghosts aren't real, so they exist." },
  { name: "Ignoratio elenchi", desc: "An argument that reaches a conclusion other than the one intended.", ex: "We need more housing. Therefore, we should build a giant shopping mall." },
  { name: "Dicto simpliciter", desc: "Applying a general rule or statement to all cases without considering exceptions.", ex: "Exercise is good for everyone. Therefore, my friend with a broken back should go jogging." },
  { name: "Secundum quid", desc: "An argument that ignores qualifications or context, leading to a hasty generalization.", ex: "You said you shouldn't lie, but you lied to save her life! You are a hypocrite." },
  { name: "False precision", desc: "Presenting data with a level of precision that is not justified by the measurements.", ex: "The dinosaur fossil is exactly 65,000,003 years old (because I found it 3 years ago)." },
  { name: "Incomplete comparison", desc: "Making a comparison without providing enough information to evaluate it.", ex: "This new detergent cleans clothes up to 50% better!" },
  { name: "Appeal to moderation", desc: "Arguing that the middle ground or moderate position is always correct.", ex: "One person wants to poison the water, another doesn't. Let's compromise and add a little poison." },
  { name: "Decision-point fallacy", desc: "Arguing that because there is no clear transition point, no difference exists.", ex: "Since we can't say exactly when a pile of sand becomes a heap, heaps don't exist." },
  { name: "Excluded middle misuse", desc: "Incorrectly applying binary choices when multiple outcomes are possible.", ex: "You either love football, or you hate all sports." },
  { name: "Conjunction fallacy", desc: "Assuming that a specific combination of events is more probable than a single general one.", ex: "Linda is a bank teller. Linda is a bank teller and is active in the feminist movement." },
  { name: "Denialism", desc: "Rejecting established scientific consensus in favor of unsupported beliefs.", ex: "I don't believe in gravity; it's just a conspiracy created by physics professors." },
  { name: "Thought-terminating cliche", desc: "Using a common phrase or cliché to end debate and bypass thinking.", ex: "At the end of the day, it is what it is." }
];

const QUIZ_LIBRARY = [
  {
    arg: "My opponent says we should reduce the city's police budget. Well, apparently he wants to abolish all laws, release every violent criminal from jail, and let chaos rule our streets!",
    fallacy: "Straw man",
    explanation: "This exaggerates the opponent's moderate budget proposal into a cartoonish extreme of abolishing all laws."
  },
  {
    arg: "I don't think you can trust Dr. Harris's recommendations on heart health. I heard he was recently divorced and has terrible relationships with his kids.",
    fallacy: "Ad hominem",
    explanation: "Attacks Dr. Harris's personal relationship struggles, which are completely unrelated to his medical expertise on heart health."
  },
  {
    arg: "If we allow the city to install bike lanes on this street, next they'll ban cars from the neighborhood, then they'll outlaw personal vehicles entirely, and we'll all be forced to ride government buses!",
    fallacy: "Slippery slope",
    explanation: "Assumes a chain of extreme consequences (banning all cars) from a small initial step (installing bike lanes) without any supporting evidence."
  },
  {
    arg: "You either support this new security surveillance system 100%, or you're on the side of the criminals. Which one is it?",
    fallacy: "False dilemma",
    explanation: "Presents only two extreme options when many middle-ground views actually exist (such as supporting security but wanting privacy protections)."
  },
  {
    arg: "Why should we listen to your complaints about our factory's pollution? You drive a gas-powered car every day, so you're just as guilty!",
    fallacy: "Tu quoque",
    explanation: "Attempts to discredit the argument by pointing out that the speaker's own behavior is hypocritical, which doesn't address the validity of the pollution concern."
  },
  {
    arg: "Organic apples must be superior. After all, they grow naturally in the wild without any human chemicals, and nature is always the best guide for health.",
    fallacy: "Appeal to nature",
    explanation: "Assumes that anything 'natural' is automatically healthy or superior, which is a fallacy since many natural things (like poison ivy or snake venom) are harmful."
  },
  {
    arg: "Professor Jenkins is a world-renowned expert on ancient Greek history, so when he writes articles saying that nuclear energy is too dangerous to use, we should believe him.",
    fallacy: "False authority",
    explanation: "Relies on Jenkins' prestige in history to validate his claims about nuclear physics, which is far outside his field of expertise."
  },
  {
    arg: "No one has ever been able to prove beyond a doubt that psychic powers don't exist. Therefore, it's highly likely that some people have telepathic abilities.",
    fallacy: "Appeal to ignorance",
    explanation: "Claims a statement must be true simply because it hasn't been proven false."
  },
  {
    arg: "The coin has landed on heads 8 times in a row! I am going to bet all my money on tails next, because it's statistically due to land on tails now.",
    fallacy: "Gambler's fallacy",
    explanation: "Believes that past random events influence the probability of a future coin toss, when each flip is completely independent."
  },
  {
    arg: "Smoking isn't nearly as dangerous as scientists say. My uncle smoked a pack of cigarettes every day from age 15 and lived to be a healthy 98 years old!",
    fallacy: "Anecdotal fallacy",
    explanation: "Uses a single personal story to counter broad scientific and statistical consensus."
  },
  {
    arg: "I've already spent $5,000 repairing this old car. If I sell it now, all that money is wasted, so I need to spend another $2,000 to fix the transmission today.",
    fallacy: "Sunk cost fallacy",
    explanation: "Forces a decision based on past non-refundable investments, ignoring that spending more money on a failing asset is a poor financial choice."
  },
  {
    arg: "I drank this organic tea, and the very next morning my cold was completely cured! This tea is a miracle cure for viruses.",
    fallacy: "Post hoc ergo propter hoc",
    explanation: "Assumes that because the cold went away after drinking the tea, the tea must have caused the recovery (ignoring natural immune system recovery)."
  },
  {
    arg: "Everyone at school is wearing this brand of shoes. If you don't buy a pair, you'll be the only outsider left behind.",
    fallacy: "Bandwagon",
    explanation: "Urges conformity based on the popularity of an action, rather than its objective merits."
  },
  {
    arg: "How can you criticize our nation's human rights record? What about the massive labor strikes and police violence happening in your own country right now?",
    fallacy: "Whataboutism",
    explanation: "Deflects criticism by accusing the opponent of a similar or worse offense instead of addressing the original point."
  },
  {
    arg: "He is a highly charismatic, handsome, and successful tech CEO, so when he says that remote work is bad for your brain, he must be speaking the absolute truth.",
    fallacy: "Halo effect",
    explanation: "Allows overall positive feelings about a person's appearance and success to bias the evaluation of their claims on neuroscience."
  },
  {
    arg: "Don't bother listening to her proposal for the new community park. She only supports it because she wants to boost the value of her nearby house.",
    fallacy: "Appeal to motive",
    explanation: "Dismisses an argument by attacking the speaker's potential self-interest rather than evaluating the park proposal itself."
  },
  {
    arg: "Every single brick in this building is extremely light and weighs less than a pound. Therefore, the entire building must be light and weigh less than a pound.",
    fallacy: "Composition",
    explanation: "Incorrectly assumes that what is true of the parts (individual bricks) must be true of the whole (the entire building)."
  },
  {
    arg: "That country has an extremely rich economy with a high GDP. Therefore, every single citizen who lives in that country must be wealthy.",
    fallacy: "Division",
    explanation: "Incorrectly assumes that what is true of the whole group must be true of every individual member."
  },
  {
    arg: "We shouldn't try to reduce carbon emissions because even if we do, some pollution will still exist. If we can't solve it completely, why bother?",
    fallacy: "Perfect solution fallacy",
    explanation: "Rejects a helpful but partial solution simply because it doesn't solve the entire problem perfectly."
  },
  {
    arg: "There's no point in debating whether this project is a good idea. At the end of the day, it is what it is.",
    fallacy: "Thought-terminating cliche",
    explanation: "Uses a common cliché to shut down discussion and avoid critical reasoning."
  },
  {
    arg: "Before you hear my opponent's argument on tax reform, I should warn you that he has twice been accused of embezzling funds from his former clients.",
    fallacy: "Poisoning the well",
    explanation: "Primes the audience with negative information to discredit the speaker before they even get a chance to speak."
  },
  {
    arg: "My opponent says we should improve the school lunch menu. Well, apparently she wants to cater to spoiled kids and turn our public school into a five-star luxury restaurant!",
    fallacy: "Straw man",
    explanation: "Misrepresents a simple lunch improvement request as a ridiculous proposal to build a luxury restaurant."
  },
  {
    arg: "I've never personally experienced any issues with our public transit system, so all these complaints in the news about train delays are completely fabricated.",
    fallacy: "Argument from personal experience",
    explanation: "Assumes one's own subjective experience constitutes the absolute reality for everyone."
  },
  {
    arg: "If we don't pass this strict curfew law right now, our streets will become overrun by gangs, and your children won't be safe stepping outside their front door.",
    fallacy: "Appeal to fear",
    explanation: "Uses extreme fear-mongering and scary scenarios to force agreement rather than presenting evidence for the curfew's effectiveness."
  },
  {
    arg: "Please do not convict my client of this burglary. He has three young kids at home, and if he goes to jail, his family will be devastated and have no source of income.",
    fallacy: "Appeal to pity",
    explanation: "Appeals to the audience's sympathy for the client's family instead of presenting evidence that he didn't commit the crime."
  }
];

export const FallacySorterWidget = () => {
  const [activeTab, setActiveTab] = useState('encyclopedia'); // 'encyclopedia' | 'quiz'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Quiz States
  const [quizState, setQuizState] = useState('idle'); // 'idle' | 'active' | 'complete'
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [quizRevealed, setQuizRevealed] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Filtered Fallacies
  const filteredFallacies = FALLACIES_DATABASE.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startQuiz = () => {
    // 1. Shuffle QUIZ_LIBRARY
    const shuffledLib = [...QUIZ_LIBRARY].sort(() => Math.random() - 0.5);
    // 2. Select first 10
    const selected = shuffledLib.slice(0, 10);
    // 3. Construct questions with 4 unique options (1 correct, 3 distractors)
    const formattedQuestions = selected.map(q => {
      const correct = q.fallacy;
      // Get all other fallacy names from DB
      const otherNames = FALLACIES_DATABASE
        .map(fd => fd.name)
        .filter(n => n.toLowerCase() !== correct.toLowerCase());
      
      // Shuffle other names and take 3
      const shuffledOthers = otherNames.sort(() => Math.random() - 0.5);
      const distractors = shuffledOthers.slice(0, 3);
      
      // Combine and shuffle options
      const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
      
      return {
        ...q,
        options
      };
    });

    setQuizQuestions(formattedQuestions);
    setCurrentQuizIndex(0);
    setSelectedQuizAnswer(null);
    setQuizRevealed(false);
    setQuizScore(0);
    setQuizState('active');
  };

  const handleQuizAnswer = (option) => {
    if (quizRevealed) return;
    setSelectedQuizAnswer(option);
    setQuizRevealed(true);
    if (option.toLowerCase() === quizQuestions[currentQuizIndex].fallacy.toLowerCase()) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    if (currentQuizIndex < 9) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedQuizAnswer(null);
      setQuizRevealed(false);
    } else {
      setQuizState('complete');
    }
  };

  const resetQuiz = () => {
    setQuizState('idle');
  };

  const getQuizRank = (s) => {
    if (s === 10) return { title: 'GRAND MASTER LOGICIAN', color: '#FFD700', icon: '🏆' };
    if (s >= 8) return { title: 'RATIONALIST EXCELLENCE', color: '#29b6f6', icon: '🥇' };
    if (s >= 5) return { title: 'CRITICAL DISCIPLIAN', color: '#ab47bc', icon: '🥈' };
    return { title: 'FALLACY APPRENTICE', color: '#ef9a9a', icon: '📚' };
  };

  const currentQ = quizQuestions[currentQuizIndex];
  const rank = getQuizRank(quizScore);

  return (
    <Paper className="glass-panel" style={{ padding: '24px', margin: '20px 0', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Header Tabs */}
      <Box style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '20px', gap: '16px' }}>
        <Button
          onClick={() => setActiveTab('encyclopedia')}
          style={{
            textTransform: 'none',
            fontWeight: 800,
            fontSize: '0.88rem',
            color: activeTab === 'encyclopedia' ? 'var(--primary-main)' : 'var(--text-secondary)',
            fontFamily: '"Outfit", sans-serif',
            background: activeTab === 'encyclopedia' ? 'rgba(41,182,246,0.1)' : 'transparent',
            borderRadius: '8px',
            padding: '6px 14px'
          }}
        >
          Fallacy Encyclopedia ({FALLACIES_DATABASE.length})
        </Button>
        <Button
          onClick={() => setActiveTab('quiz')}
          style={{
            textTransform: 'none',
            fontWeight: 800,
            fontSize: '0.88rem',
            color: activeTab === 'quiz' ? 'var(--primary-main)' : 'var(--text-secondary)',
            fontFamily: '"Outfit", sans-serif',
            background: activeTab === 'quiz' ? 'rgba(41,182,246,0.1)' : 'transparent',
            borderRadius: '8px',
            padding: '6px 14px'
          }}
        >
          Practice Quiz (10 Qs)
        </Button>
      </Box>

      {activeTab === 'encyclopedia' ? (
        /* ── ENCYCLOPEDIA TAB ── */
        <Box>
          <TextField
            fullWidth
            size="small"
            placeholder="Search among 149 logical fallacies..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setExpandedIndex(null);
            }}
            InputProps={{
              style: {
                color: 'var(--text-primary)',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '10px',
                fontFamily: '"Outfit", sans-serif',
                fontSize: '0.88rem'
              }
            }}
            style={{ marginBottom: '16px' }}
          />

          <Box style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredFallacies.length === 0 ? (
              <Typography variant="body2" style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                No fallacies match your search.
              </Typography>
            ) : (
              filteredFallacies.map((item, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                  <Box
                    key={idx}
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    style={{
                      background: isExpanded ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      transition: 'background 0.25s, transform 0.2s'}}
                  >
                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: '"Outfit", sans-serif' }}>
                        {idx + 1}. {item.name}
                      </Typography>
                      <Typography style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        ▶
                      </Typography>
                    </Box>
                    <Typography variant="body2" style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', display: isExpanded ? 'none' : '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                      {item.desc}
                    </Typography>

                    {isExpanded && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                        <Typography variant="body2" style={{ color: 'var(--text-primary)', fontSize: '0.82rem', marginBottom: '8px', lineHeight: 1.4 }}>
                          <b>Definition:</b> {item.desc}
                        </Typography>
                        <Box style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', borderLeft: '3px solid var(--primary-main)' }}>
                          <Typography variant="caption" style={{ color: 'var(--text-secondary)', display: 'block', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>Example:</Typography>
                          <Typography variant="body2" style={{ color: 'var(--text-primary)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                            "{item.ex}"
                          </Typography>
                        </Box>
                      </motion.div>
                    )}
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      ) : (
        /* ── QUIZ TAB ── */
        <Box>
          {quizState === 'idle' && (
            <Box style={{ textAlign: 'center', padding: '24px 10px' }}>
              <Typography style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🧠</Typography>
              <Typography variant="subtitle1" style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: '"Outfit", sans-serif', marginBottom: '8px' }}>
                The Fallacy Master Challenge
              </Typography>
              <Typography variant="body2" style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px', fontSize: '0.85rem' }}>
                Test your logical deduction. We will pick 10 random arguments from the database.
                For each, diagnose the correct fallacy. Distractors are generated dynamically!
              </Typography>
              <Button
                variant="contained"
                onClick={startQuiz}
                style={{ background: 'var(--hero-gradient)', color: '#fff', fontWeight: 800, borderRadius: '12px', textTransform: 'none', fontFamily: '"Outfit", sans-serif', padding: '8px 24px' }}
              >
                Start Practice Quiz
              </Button>
            </Box>
          )}

          {quizState === 'active' && (
            <motion.div key={currentQuizIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              {/* Progress */}
              <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <Typography variant="caption" style={{ color: 'var(--text-secondary)', fontWeight: 800 }}>
                  QUESTION {currentQuizIndex + 1} OF 10
                </Typography>
                <Box style={{ width: '80px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <Box style={{ width: `${((currentQuizIndex + (quizRevealed ? 1 : 0)) / 10) * 100}%`, height: '100%', background: 'var(--primary-main)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
                </Box>
              </Box>

              {/* Argument Card */}
              <Box style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '16px' }}>
                <Typography variant="body2" style={{ fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.5, fontSize: '0.9rem' }}>
                  "{currentQ.arg}"
                </Typography>
              </Box>

              {/* Multi-choice options */}
              <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {currentQ.options.map((opt, i) => {
                  const labels = ['A', 'B', 'C', 'D'];
                  const isSelected = selectedQuizAnswer === opt;
                  const isCorrect = opt.toLowerCase() === currentQ.fallacy.toLowerCase();

                  let bg = 'rgba(255,255,255,0.02)';
                  let border = '1px solid rgba(255,255,255,0.08)';
                  let color = 'var(--text-primary)';
                  let labelBg = 'rgba(255,255,255,0.06)';

                  if (quizRevealed) {
                    if (isCorrect) {
                      bg = 'rgba(76,175,80,0.10)'; border = '1.5px solid #4CAF50'; color = '#4CAF50'; labelBg = 'rgba(76,175,80,0.25)';
                    } else if (isSelected) {
                      bg = 'rgba(244,67,54,0.10)'; border = '1.5px solid #f44336'; color = '#f44336'; labelBg = 'rgba(244,67,54,0.25)';
                    }
                  } else if (isSelected) {
                    bg = 'rgba(28,176,246,0.10)'; border = '1.5px solid var(--primary-main)'; color = 'var(--primary-main)'; labelBg = 'rgba(28,176,246,0.25)';
                  }

                  return (
                    <motion.button
                      key={opt}
                      disabled={quizRevealed}
                      whileHover={!quizRevealed ? { x: 4 } : {}}
                      onClick={() => handleQuizAnswer(opt)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px', borderRadius: '10px',
                        background: bg, border, color,
                        cursor: quizRevealed ? 'default' : 'pointer',
                        fontFamily: '"Outfit", sans-serif', textAlign: 'left',
                        transition: 'background 0.2s, border-color 0.2s, color 0.2s'
                      }}
                    >
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '24px', height: '24px', borderRadius: '6px',
                        background: labelBg, fontWeight: 900, fontSize: '0.75rem',
                        flexShrink: 0
                      }}>{labels[i]}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{opt}</span>
                      {quizRevealed && isCorrect && <span style={{ marginLeft: 'auto', fontSize: '1rem' }}>✓</span>}
                      {quizRevealed && isSelected && !isCorrect && <span style={{ marginLeft: 'auto', fontSize: '1rem' }}>✗</span>}
                    </motion.button>
                  );
                })}
              </Box>

              {/* Explanatory notes */}
              {quizRevealed && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  <Box style={{
                    padding: '12px 16px', borderRadius: '10px', marginBottom: '14px',
                    background: selectedQuizAnswer.toLowerCase() === currentQ.fallacy.toLowerCase() ? 'rgba(76,175,80,0.06)' : 'rgba(244,67,54,0.06)',
                    borderLeft: `3px solid ${selectedQuizAnswer.toLowerCase() === currentQ.fallacy.toLowerCase() ? '#4CAF50' : '#f44336'}`
                  }}>
                    <Typography variant="subtitle2" style={{ fontWeight: 800, color: selectedQuizAnswer.toLowerCase() === currentQ.fallacy.toLowerCase() ? '#4CAF50' : '#f44336', marginBottom: '2px', fontSize: '0.8rem' }}>
                      {selectedQuizAnswer.toLowerCase() === currentQ.fallacy.toLowerCase() ? `✓ Correct — This is a ${currentQ.fallacy}` : `✗ Incorrect — This is a ${currentQ.fallacy}`}
                    </Typography>
                    <Typography variant="body2" style={{ color: 'var(--text-secondary)', lineHeight: 1.4, fontSize: '0.78rem' }}>
                      {currentQ.explanation}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={handleNextQuiz}
                    style={{ background: 'var(--hero-gradient)', color: '#fff', fontWeight: 800, borderRadius: '10px', textTransform: 'none', fontFamily: '"Outfit", sans-serif', padding: '6px 18px' }}
                  >
                    {currentQuizIndex < 9 ? 'Next Question →' : 'See Score Card'}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {quizState === 'complete' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Box style={{ textAlign: 'center', padding: '24px 10px' }}>
                <Typography style={{ fontSize: '2.5rem', marginBottom: '4px' }}>{rank.icon}</Typography>
                <Typography variant="subtitle1" style={{ fontWeight: 900, color: rank.color, letterSpacing: '0.05em', fontFamily: '"Outfit", sans-serif', marginBottom: '4px' }}>
                  {rank.title}
                </Typography>
                <Typography variant="body1" style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '14px' }}>
                  You scored <span style={{ color: rank.color }}>{quizScore}</span> out of 10
                </Typography>

                <Box style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: '20px' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(quizScore / 10) * 100}%` }}
                    transition={{ duration: 0.8 }}
                    style={{ height: '100%', background: rank.color, borderRadius: '4px' }}
                  />
                </Box>

                <Box style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <Button
                    variant="contained"
                    onClick={startQuiz}
                    style={{ background: 'var(--hero-gradient)', color: '#fff', fontWeight: 800, borderRadius: '10px', textTransform: 'none', fontFamily: '"Outfit", sans-serif', padding: '6px 18px' }}
                  >
                    Retake Challenge
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={resetQuiz}
                    style={{ color: 'var(--text-primary)', borderColor: 'rgba(255,255,255,0.2)', fontWeight: 800, borderRadius: '10px', textTransform: 'none', fontFamily: '"Outfit", sans-serif', padding: '6px 18px' }}
                  >
                    Exit Quiz
                  </Button>
                </Box>
              </Box>
            </motion.div>
          )}
        </Box>
      )}
    </Paper>
  );
};


// 4. Ship of Theseus Widget (Advanced Visual SVG)
export const ShipOfTheseusWidget = () => {
  const [planks, setPlanks] = useState(['wood', 'wood', 'wood', 'wood', 'wood']);
  const [replaceCount, setReplaceCount] = useState(0);
  const [identityResponses, setIdentityResponses] = useState([]);
  const [finalChoice, setFinalChoice] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [particles, setParticles] = useState([]);

  // ViewBox: 0 0 500 290 | Deck: y=125 | Keel/waterline: y=195 | Mast top: y=22
  const plankPaths = [
    { d: "M 100,125 Q 250,129 400,125 L 392,141 Q 250,145 108,141 Z", label: "Deck Plank" },
    { d: "M 108,141 Q 250,145 392,141 L 383,157 Q 250,161 117,157 Z", label: "Upper Hull Plank" },
    { d: "M 117,157 Q 250,161 383,157 L 374,171 Q 250,175 126,171 Z", label: "Middle Hull Plank" },
    { d: "M 126,171 Q 250,175 374,171 L 365,183 Q 250,187 135,183 Z", label: "Lower Hull Plank" },
    { d: "M 135,183 Q 250,187 365,183 L 357,195 Q 250,198 143,195 Z", label: "Keel Plank" }
  ];

  const handlePlankClick = (index) => {
    if (planks[index] === 'steel') return;
    if (replaceCount > 0 && identityResponses.length < replaceCount) return; // Answer current question first

    setPlanks(prev => {
      const next = [...prev];
      next[index] = 'steel';
      return next;
    });

    // Spark particles spawn near hull center (adjusted for wider ship)
    const startX = 140 + index * 32 + Math.random() * 20;
    const startY = 133 + index * 14 + Math.random() * 6;
    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Math.random() + i,
      x: startX,
      y: startY,
      angle: (i * 2 * Math.PI) / 12 + Math.random() * 0.4 - 0.2,
      distance: 20 + Math.random() * 20
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 850);

    setReplaceCount(prev => prev + 1);
  };

  const handleResponse = (isStillTheseus) => {
    setIdentityResponses(prev => [...prev, { plankNum: replaceCount, response: isStillTheseus }]);
  };

  const handleReset = () => {
    setPlanks(['wood', 'wood', 'wood', 'wood', 'wood']);
    setReplaceCount(0);
    setIdentityResponses([]);
    setFinalChoice('');
    setShowAnalysis(false);
    setParticles([]);
  };

  return (
    <Paper className="glass-panel" style={{ padding: '24px', margin: '20px 0', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Metaphysics Lab: The Ship of Theseus
      </Typography>

      <Typography variant="body2" style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
        Theseus returned from Crete in a ship. Over time, planks decayed and were replaced. 
        <b> Click on the wooden planks</b> below to replace them with polished steel. Reflect on its identity.
      </Typography>

      {replaceCount < 5 ? (
        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' }}>
          {/* Simplified Elegant Greek Trireme SVG */}
          <svg viewBox="0 0 500 290" width="100%" height="420" style={{ background: 'linear-gradient(to bottom, #a0c4ff 0%, #c4e0e5 55%, #e0f7fa 100%)', borderRadius: '14px', border: '1px solid rgba(41,182,246,0.15)', overflow: 'hidden' }}>
            
            {/* ── MOVING CLOUDS IN THE BACKGROUND ── */}
            <g opacity="0.8">
              {/* Cloud 1 - Slow speed */}
              <motion.g
                animate={{ x: [-250, 750] }}
                transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
              >
                <path d="M -40,60 C -30,45 -10,45 0,55 C 10,45 30,45 40,60 C 50,55 65,65 60,75 C 55,85 -30,85 -35,75 C -40,65 -45,60 -40,60 Z" fill="#ffffff" />
                <circle cx="-38" cy="68" r="9" fill="#ffffff" />
              </motion.g>
              
              {/* Cloud 2 - Medium speed */}
              <motion.g
                animate={{ x: [-280, 750] }}
                transition={{ repeat: Infinity, duration: 78, ease: "linear" }}
              >
                <path d="M -50,50 C -40,35 -20,35 -10,45 C 0,35 20,35 30,50 C 40,45 55,55 50,65 C 45,75 -40,75 -45,65 C -50,55 -55,50 -50,50 Z" fill="#ffffff" opacity="0.85" />
                <circle cx="-48" cy="58" r="9" fill="#ffffff" opacity="0.85" />
              </motion.g>
              
              {/* Cloud 3 - Fast speed */}
              <motion.g
                animate={{ x: [-320, 750] }}
                transition={{ repeat: Infinity, duration: 42, ease: "linear" }}
              >
                <path d="M -40,40 C -30,30 -15,30 -7,38 C 0,30 15,30 23,40 C 30,36 40,44 37,52 C 33,60 -35,60 -38,52 C -42,44 -46,40 -40,40 Z" fill="#ffffff" opacity="0.6" />
                <circle cx="-38" cy="48" r="7.5" fill="#ffffff" opacity="0.6" />
              </motion.g>
            </g>

            {/* ── WATER LAYER 1 (Back Waving Water) ── */}
            <motion.path
              d="M -200,185 C 0,175 150,195 300,185 C 450,175 550,195 700,185 L 700,320 L -200,320 Z"
              fill="#1d5e9b"
              animate={{ d: [
                "M -200,185 C 0,175 150,195 300,185 C 450,175 550,195 700,185 L 700,320 L -200,320 Z",
                "M -200,192 C 0,182 150,202 300,192 C 450,182 550,202 700,192 L 700,320 L -200,320 Z",
                "M -200,180 C 0,170 150,190 300,180 C 450,170 550,190 700,180 L 700,320 L -200,320 Z",
                "M -200,185 C 0,175 150,195 300,185 C 450,175 550,195 700,185 L 700,320 L -200,320 Z"
              ]}}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* ── WATER LAYER 2 (Front Waving Water) ── */}
            <motion.path
              d="M -200,195 C -50,205 100,185 250,195 C 400,205 550,185 700,195 L 700,320 L -200,320 Z"
              fill="#124675"
              animate={{ d: [
                "M -200,195 C -50,205 100,185 250,195 C 400,205 550,185 700,195 L 700,320 L -200,320 Z",
                "M -200,188 C -50,198 100,178 250,188 C 400,198 550,178 700,188 L 700,320 L -200,320 Z",
                "M -200,200 C -50,210 100,190 250,200 C 400,210 550,190 700,200 L 700,320 L -200,320 Z",
                "M -200,195 C -50,205 100,185 250,195 C 400,205 550,185 700,195 L 700,320 L -200,320 Z"
              ]}}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* ── ROCKING SHIP GROUP (Drawn in front of the water) ── */}
            <motion.g
              animate={{
                y: [0, -3, 2, -3, 0],
                rotate: [0, -1, 1, -1, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "250px 160px" }}
            >
              {/* Rigging Stays (drawn behind mast and sail) */}
              <line x1="250" y1="25" x2="105" y2="125" stroke="#a1887f" strokeWidth="1.5" opacity="0.5" />
              <line x1="250" y1="25" x2="395" y2="125" stroke="#a1887f" strokeWidth="1.5" opacity="0.5" />

              {/* Mast (wooden vertical support - rendered behind the sail) */}
              <line x1="250" y1="125" x2="250" y2="25" stroke="#5d4037" strokeWidth="6" strokeLinecap="round" />

              {/* Yard (horizontal spar holding sail - rendered behind the sail) */}
              <line x1="125" y1="32" x2="375" y2="32" stroke="#5d4037" strokeWidth="4" strokeLinecap="round" />

              {/* Billowing Sail (rendered in front of mast & yard - billowing to the right) */}
              <path d="M 150,32 Q 250,42 350,32 Q 380,72 345,112 Q 250,122 155,112 Q 180,72 150,32 Z"
                fill="rgba(248, 245, 235, 0.95)" stroke="#d4c5a1" strokeWidth="1.5" />
              
              {/* Brand Logo printed on sail (rendered on top of sail) */}
              <image
                href={logoImg}
                x="225"
                y="52"
                width="50"
                height="50"
                style={{ filter: 'brightness(0)', opacity: 0.35 }}
              />

              {/* Deck Rail */}
              <line x1="100" y1="125" x2="400" y2="125" stroke="#5d4037" strokeWidth="3" strokeLinecap="round" />

              {/* Clickable Planks */}
              {plankPaths.map((plank, idx) => {
                const material = planks[idx];
                const isInteractable = replaceCount === 0 || identityResponses.length >= replaceCount;
                return (
                  <path
                    key={idx}
                    d={plank.d}
                    fill={material === 'wood' ? (idx % 2 === 0 ? '#8d5a2b' : '#7a4f26') : (idx % 2 === 0 ? '#b0bec5' : '#9eadb5')}
                    stroke={material === 'wood' ? '#5d4037' : '#78909c'}
                    strokeWidth="1.2"
                    style={{
                      cursor: material === 'wood' && isInteractable ? 'pointer' : 'default',
                      transition: 'fill 0.4s ease, filter 0.2s ease',
                      filter: material === 'wood' && isInteractable ? 'brightness(0.95)' : 'none'
                    }}
                    onClick={() => { if (isInteractable) handlePlankClick(idx); }}
                    onMouseEnter={e => {
                      if (material === 'wood' && isInteractable)
                        e.currentTarget.style.filter = 'brightness(1.25) drop-shadow(0 0 6px #a0632e)';
                    }}
                    onMouseLeave={e => {
                      if (material === 'wood' && isInteractable)
                        e.currentTarget.style.filter = 'brightness(0.95)';
                    }}
                  />
                );
              })}

              {/* Oars (sticks centered inside wider hull) */}
              {[0,1,2,3,4,5].map(i => {
                const pivotX = 145 + i * 38;
                const mat = planks[Math.min(i, 4)];
                const clr = mat === 'wood' ? '#a1887f' : '#90a4ae';
                return (
                  <g key={i}>
                    <line x1={pivotX} y1="178" x2={pivotX - 10} y2="215" stroke={clr} strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
                    <ellipse cx={pivotX - 11} cy="217" rx="5.5" ry="2.5" fill={clr} opacity="0.85" transform={`rotate(-15,${pivotX - 11},217)`} />
                  </g>
                );
              })}
            </motion.g>

            {/* ── DISCARDED PLANKS PILE ── */}
            {replaceCount >= 1 && (
              <g opacity="0.9">
                <text x="20" y="243" fill="rgba(255,255,255,0.6)" fontSize="8" fontWeight="800" fontFamily="monospace">DISCARDED</text>
                <text x="20" y="252" fill="rgba(255,255,255,0.6)" fontSize="8" fontWeight="800" fontFamily="monospace">WOOD</text>
                {Array.from({ length: replaceCount }).map((_, i) => {
                  const rots = [10, -14, 5, 25, -8];
                  const ys = [258, 264, 256, 268, 261];
                  return (
                    <rect key={i} x="16" y={ys[i]} width="54" height="5.5" rx="1.5"
                      fill="#8d5a2b" stroke="#5d4037" strokeWidth="1"
                      transform={`rotate(${rots[i]},${16+27},${ys[i]+2.75})`} />
                  );
                })}
              </g>
            )}

            {/* ── SPARK PARTICLES ── */}
            {particles.map(p => (
              <motion.circle key={p.id} cx={p.x} cy={p.y} r={2.5} fill="#ffeb3b"
                initial={{ opacity: 1, scale: 1 }}
                animate={{ cx: p.x + Math.cos(p.angle) * p.distance, cy: p.y + Math.sin(p.angle) * p.distance, opacity: 0, scale: 0.2 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            ))}
          </svg>

          <Typography variant="body2" style={{ color: 'var(--text-secondary)', margin: '10px 0' }}>
            Planks Replaced: <b>{replaceCount}/5</b>
          </Typography>

          {replaceCount > 0 && identityResponses.length < replaceCount && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginTop: '10px' }}>
              <Typography variant="body2" style={{ fontWeight: 800, marginBottom: '10px', color: 'var(--text-primary)' }}>
                Question: With {replaceCount} steel plank(s) installed, is this still the <i>original</i> Ship of Theseus?
              </Typography>
              <Box style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <Button size="small" variant="outlined" onClick={() => handleResponse(true)}
                  style={{ textTransform: 'none', borderRadius: '8px', fontWeight: 800, color: 'var(--text-primary)', borderColor: 'rgba(128,128,128,0.25)' }}>
                  Yes, it is
                </Button>
                <Button size="small" variant="outlined" onClick={() => handleResponse(false)}
                  style={{ textTransform: 'none', borderRadius: '8px', fontWeight: 800, color: 'var(--text-primary)', borderColor: 'rgba(128,128,128,0.25)' }}>
                  No, it has changed
                </Button>
              </Box>
            </motion.div>
          )}
        </Box>

      ) : (
        <Box>
          <Typography variant="body2" style={{ color: '#4CAF50', fontWeight: 800, textAlign: 'center', marginBottom: '16px' }}>
            ✓ All planks replaced! We now have two ships to compare in the harbor.
          </Typography>
          <Grid container spacing={3} style={{ marginBottom: '20px' }}>
            <Grid item xs={12} sm={6}>
              <Box style={{ padding: '12px', background: 'rgba(10,25,50,0.3)', borderRadius: '12px', border: '1px solid rgba(41,182,246,0.15)', textAlign: 'center' }}>
                <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>Ship A — Steel Hull</Typography>
                <svg viewBox="0 0 500 230" width="100%" height="195" style={{ background: 'linear-gradient(to bottom, #a0c4ff 0%, #c4e0e5 55%, #e0f7fa 100%)', overflow: 'hidden' }}>
                  {/* Moving Clouds */}
                  <g opacity="0.6">
                    <motion.g
                      animate={{ x: [-250, 750] }}
                      transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
                    >
                      <path d="M -40,40 C -30,28 -10,28 0,36 C 10,28 30,28 40,40 C 50,36 65,44 60,52 C 55,60 -30,60 -35,52 C -40,44 -45,40 -40,40 Z" fill="#ffffff" />
                      <circle cx="-38" cy="48" r="7.5" fill="#ffffff" />
                    </motion.g>
                    <motion.g
                      animate={{ x: [-280, 750] }}
                      transition={{ repeat: Infinity, duration: 78, ease: "linear" }}
                    >
                      <path d="M -50,35 C -40,23 -20,23 -10,31 C 0,23 20,23 30,35 C 40,31 55,39 50,47 C 45,55 -40,55 -45,47 C -50,39 -55,35 -50,35 Z" fill="#ffffff" opacity="0.8" />
                      <circle cx="-48" cy="43" r="7.5" fill="#ffffff" opacity="0.8" />
                    </motion.g>
                  </g>
                  {/* Water Layer 1 (Back Water) */}
                  <path d="M -200,160 C 0,152 150,168 300,160 C 450,152 550,168 700,160 L 700,240 L -200,240 Z" fill="#1d5e9b" opacity="0.9" />
                  {/* Water Layer 2 (Front Water) */}
                  <path d="M -200,168 C -50,176 100,160 250,168 C 400,176 550,160 700,168 L 700,240 L -200,240 Z" fill="#124675" />

                  {/* Rocking Ship Group */}
                  <motion.g
                    animate={{
                      y: [0, -2, 1, -2, 0],
                      rotate: [0, -0.8, 0.8, -0.8, 0]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: "250px 130px" }}
                  >
                    {/* Rigging (background) */}
                    <line x1="250" y1="20" x2="105" y2="110" stroke="#a1887f" strokeWidth="1.2" opacity="0.5" />
                    <line x1="250" y1="20" x2="395" y2="110" stroke="#a1887f" strokeWidth="1.2" opacity="0.5" />
                    
                    {/* Mast (wooden support - rendered behind sail) */}
                    <line x1="250" y1="110" x2="250" y2="20" stroke="#5d4037" strokeWidth="5" strokeLinecap="round" />
                    
                    {/* Yard (horizontal spar - rendered behind sail) */}
                    <line x1="125" y1="26" x2="375" y2="26" stroke="#5d4037" strokeWidth="3.5" strokeLinecap="round" />

                    {/* Sail (rendered in front of mast/yard - billowing to the right) */}
                    <path d="M 150,26 Q 250,34 350,26 Q 380,63 345,100 Q 250,109 155,100 Q 180,63 150,26 Z" fill="rgba(248, 245, 235, 0.9)" stroke="#d4c5a1" strokeWidth="1" />
                    
                    {/* Brand Logo printed on sail (rendered on top of sail) */}
                    <image
                      href={logoImg}
                      x="229"
                      y="44"
                      width="42"
                      height="42"
                      style={{ filter: 'brightness(0)', opacity: 0.35 }}
                    />

                    {/* Deck rail */}
                    <line x1="100" y1="110" x2="400" y2="110" stroke="#5d4037" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Planks (Steel) */}
                    {[
                      "M 100,110 Q 252,114 400,110 L 392,123 Q 252,127 108,123 Z",
                      "M 108,123 Q 252,127 392,123 L 383,136 Q 252,140 117,136 Z",
                      "M 117,136 Q 252,140 383,136 L 374,148 Q 252,152 126,148 Z",
                      "M 126,148 Q 252,152 374,148 L 365,158 Q 252,161 135,158 Z",
                      "M 175,158 Q 252,161 329,158 L 323,168 Q 252,171 181,168 Z"
                    ].map((d, i) => (
                      <path key={i} d={d} fill={i % 2 === 0 ? '#b0bec5' : '#9eadb5'} stroke="#78909c" strokeWidth="1" />
                    ))}
                    {/* Oars */}
                    {[0,1,2,3,4,5].map(i => {
                      const pivotX = 145 + i * 38;
                      return (
                        <g key={i}>
                          <line x1={pivotX} y1="153" x2={pivotX - 8} y2="185" stroke="#90a4ae" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                          <ellipse cx={pivotX - 9} cy="187" rx="4.5" ry="2" fill="#90a4ae" opacity="0.8" />
                        </g>
                      );
                    })}
                  </motion.g>
                </svg>
                <Typography variant="caption" style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>
                  Continuously repaired in the harbor — same form, same function.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box style={{ padding: '12px', background: 'rgba(10,25,50,0.3)', borderRadius: '12px', border: '1px solid rgba(41,182,246,0.15)', textAlign: 'center' }}>
                <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>Ship B — Original Wood</Typography>
                <svg viewBox="0 0 500 230" width="100%" height="195" style={{ background: 'linear-gradient(to bottom, #a0c4ff 0%, #c4e0e5 55%, #e0f7fa 100%)', overflow: 'hidden' }}>
                  {/* Moving Clouds */}
                  <g opacity="0.6">
                    <motion.g
                      animate={{ x: [-250, 750] }}
                      transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
                    >
                      <path d="M -40,40 C -30,28 -10,28 0,36 C 10,28 30,28 40,40 C 50,36 65,44 60,52 C 55,60 -30,60 -35,52 C -40,44 -45,40 -40,40 Z" fill="#ffffff" />
                      <circle cx="-38" cy="48" r="7.5" fill="#ffffff" />
                    </motion.g>
                    <motion.g
                      animate={{ x: [-280, 750] }}
                      transition={{ repeat: Infinity, duration: 78, ease: "linear" }}
                    >
                      <path d="M -50,35 C -40,23 -20,23 -10,31 C 0,23 20,23 30,35 C 40,31 55,39 50,47 C 45,55 -40,55 -45,47 C -50,39 -55,35 -50,35 Z" fill="#ffffff" opacity="0.8" />
                      <circle cx="-48" cy="43" r="7.5" fill="#ffffff" opacity="0.8" />
                    </motion.g>
                  </g>
                  {/* Water Layer 1 (Back Water) */}
                  <path d="M -200,160 C 0,152 150,168 300,160 C 450,152 550,168 700,160 L 700,240 L -200,240 Z" fill="#1d5e9b" opacity="0.9" />
                  {/* Water Layer 2 (Front Water) */}
                  <path d="M -200,168 C -50,176 100,160 250,168 C 400,176 550,160 700,168 L 700,240 L -200,240 Z" fill="#124675" />

                  {/* Rocking Ship Group */}
                  <motion.g
                    animate={{
                      y: [0, -2, 1, -2, 0],
                      rotate: [0, -0.8, 0.8, -0.8, 0]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: "250px 130px" }}
                  >
                    {/* Rigging (background) */}
                    <line x1="250" y1="20" x2="105" y2="110" stroke="#a1887f" strokeWidth="1.2" opacity="0.5" />
                    <line x1="250" y1="20" x2="395" y2="110" stroke="#a1887f" strokeWidth="1.2" opacity="0.5" />

                    {/* Mast (wooden support - rendered behind sail) */}
                    <line x1="250" y1="110" x2="250" y2="20" stroke="#5d4037" strokeWidth="5" strokeLinecap="round" />
                    
                    {/* Yard (horizontal spar - rendered behind sail) */}
                    <line x1="125" y1="26" x2="375" y2="26" stroke="#5d4037" strokeWidth="3.5" strokeLinecap="round" />

                    {/* Sail (rendered in front of mast/yard - billowing to the right) */}
                    <path d="M 150,26 Q 250,34 350,26 Q 380,63 345,100 Q 250,109 155,100 Q 180,63 150,26 Z" fill="rgba(248, 245, 235, 0.9)" stroke="#d4c5a1" strokeWidth="1" />
                    
                    {/* Brand Logo printed on sail (rendered on top of sail) */}
                    <image
                      href={logoImg}
                      x="229"
                      y="44"
                      width="42"
                      height="42"
                      style={{ filter: 'brightness(0)', opacity: 0.35 }}
                    />

                    {/* Deck rail */}
                    <line x1="100" y1="110" x2="400" y2="110" stroke="#5d4037" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Planks (Wood) */}
                    {[
                      "M 100,110 Q 252,114 400,110 L 392,123 Q 252,127 108,123 Z",
                      "M 108,123 Q 252,127 392,123 L 383,136 Q 252,140 117,136 Z",
                      "M 117,136 Q 252,140 383,136 L 374,148 Q 252,152 126,148 Z",
                      "M 126,148 Q 252,152 374,148 L 365,158 Q 252,161 135,158 Z",
                      "M 175,158 Q 252,161 329,158 L 323,168 Q 252,171 181,168 Z"
                    ].map((d, i) => (
                      <path key={i} d={d} fill={i % 2 === 0 ? '#8d5a2b' : '#7a4f26'} stroke="#5d4037" strokeWidth="1" />
                    ))}
                    {/* Oars */}
                    {[0,1,2,3,4,5].map(i => {
                      const pivotX = 145 + i * 38;
                      return (
                        <g key={i}>
                          <line x1={pivotX} y1="153" x2={pivotX - 8} y2="185" stroke="#a1887f" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                          <ellipse cx={pivotX - 9} cy="187" rx="4.5" ry="2" fill="#a1887f" opacity="0.8" />
                        </g>
                      );
                    })}
                  </motion.g>
                </svg>
                <Typography variant="caption" style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>
                  Rebuilt in dry dock from all the discarded planks — original substance.
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box style={{ border: '1px dashed rgba(128,128,128,0.25)', padding: '16px', borderRadius: '12px', marginBottom: '20px', background: 'rgba(128,128,128,0.02)' }}>
            <Typography variant="body2" style={{ fontWeight: 800, marginBottom: '12px', textAlign: 'center' }}>
              Which ship is the TRUE Ship of Theseus?
            </Typography>

            <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button
                variant={finalChoice === 'ship_a' ? 'contained' : 'outlined'}
                onClick={() => { setFinalChoice('ship_a'); setShowAnalysis(true); }}
                style={{
                  textTransform: 'none',
                  justifyContent: 'flex-start',
                  borderRadius: '10px',
                  borderColor: finalChoice === 'ship_a' ? 'none' : 'rgba(128,128,128,0.25)',
                  backgroundColor: finalChoice === 'ship_a' ? 'var(--primary-main)' : 'transparent',
                  color: finalChoice === 'ship_a' ? '#fff' : 'var(--text-primary)'
                }}
              >
                Ship A (Continuity of Form and Spatio-Temporal path)
              </Button>
              <Button
                variant={finalChoice === 'ship_b' ? 'contained' : 'outlined'}
                onClick={() => { setFinalChoice('ship_b'); setShowAnalysis(true); }}
                style={{
                  textTransform: 'none',
                  justifyContent: 'flex-start',
                  borderRadius: '10px',
                  borderColor: finalChoice === 'ship_b' ? 'none' : 'rgba(128,128,128,0.25)',
                  backgroundColor: finalChoice === 'ship_b' ? 'var(--primary-main)' : 'transparent',
                  color: finalChoice === 'ship_b' ? '#fff' : 'var(--text-primary)'
                }}
              >
                Ship B (Continuity of Material Substance)
              </Button>
              <Button
                variant={finalChoice === 'both' ? 'contained' : 'outlined'}
                onClick={() => { setFinalChoice('both'); setShowAnalysis(true); }}
                style={{
                  textTransform: 'none',
                  justifyContent: 'flex-start',
                  borderRadius: '10px',
                  borderColor: finalChoice === 'both' ? 'none' : 'rgba(128,128,128,0.25)',
                  backgroundColor: finalChoice === 'both' ? 'var(--primary-main)' : 'transparent',
                  color: finalChoice === 'both' ? '#fff' : 'var(--text-primary)'
                }}
              >
                Both / Neither (Identity is an overlaying construct)
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {showAnalysis && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Box style={{ padding: '16px', background: 'rgba(28, 176, 246, 0.05)', border: '1.5px solid var(--primary-main)', borderRadius: '12px', marginBottom: '16px' }}>
            <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', marginBottom: '6px' }}>
              Philosophical Breakdown
            </Typography>
            <Typography variant="body2" style={{ color: 'var(--text-primary)', lineHeight: 1.5, fontSize: '0.82rem' }}>
              {finalChoice === 'ship_a' && "You favor Spatio-Temporal Continuity (Thomas Hobbes). Since Ship A continuously existed in the harbor as 'the ship' while undergoing repairs, its identity was preserved step-by-step. Form and function determine identity."}
              {finalChoice === 'ship_b' && "You favor Material Identity (Aristotle's Material Cause). Since Ship B is made of the actual wood planks that Theseus stood on, it holds the genuine material substance of the original. Substance determines identity."}
              {finalChoice === 'both' && "You hold a bundle theory or anti-realist view of identity. You see that 'Ship of Theseus' is a conceptual label we assign for convenience, not an absolute property of the matter itself. Both have distinct, valid logical claims."}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={handleReset}
            style={{
              borderColor: 'rgba(128,128,128,0.25)',
              color: 'var(--text-primary)',
              fontWeight: 800,
              borderRadius: '10px',
              textTransform: 'none'
            }}
          >
            Reset Simulator
          </Button>
        </motion.div>
      )}
    </Paper>
  );
};

// Helper Stick Figure component for Trolley Problem visualization (Fully theme compatible)
const StickFigure = ({ x, y, color = "var(--text-primary)", bg = "none", scale = 1, isDead = false }) => {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} style={{ transition: 'all 0.5s' }}>
      {/* Head */}
      <circle cx="0" cy="-24" r="5" fill={bg} stroke={color} strokeWidth="2" />
      {/* Torso */}
      <line x1="0" y1="-19" x2="0" y2="-7" stroke={color} strokeWidth="2" />
      {/* Arms */}
      <line x1="-8" y1="-15" x2="8" y2="-15" stroke={color} strokeWidth="2" />
      {/* Legs */}
      <line x1="0" y1="-7" x2="-5" y2="5" stroke={color} strokeWidth="2" />
      <line x1="0" y1="-7" x2="5" y2="5" stroke={color} strokeWidth="2" />
      {/* Dead Mark */}
      {isDead && (
        <path d="M -6,-26 L 6,-10 M 6,-26 L -6,-10" stroke="#FF5252" strokeWidth="2.5" />
      )}
    </g>
  );
};

// Advanced Trolley Vector Drawing
const AdvancedTrolleySVG = () => (
  <g>
    {/* Body Shadow */}
    <rect x="-24" y="-8" width="48" height="20" rx="3" fill="rgba(0,0,0,0.3)" />
    {/* Metallic Main Body */}
    <rect x="-22" y="-12" width="44" height="22" rx="4" fill="#d32f2f" stroke="#b71c1c" strokeWidth="1.5" />
    {/* Rivet Details */}
    <circle cx="-18" cy="-8" r="0.8" fill="#ff8a80" />
    <circle cx="18" cy="-8" r="0.8" fill="#ff8a80" />
    <circle cx="-18" cy="6" r="0.8" fill="#ff8a80" />
    <circle cx="18" cy="6" r="0.8" fill="#ff8a80" />
    {/* Windows */}
    <rect x="-14" y="-7" width="8" height="7" rx="1" fill="#e0f7fa" stroke="#b71c1c" strokeWidth="1" />
    <rect x="-2" y="-7" width="8" height="7" rx="1" fill="#e0f7fa" stroke="#b71c1c" strokeWidth="1" />
    {/* Window Glare Reflection */}
    <line x1="-12" y1="-5" x2="-8" y2="-2" stroke="#fff" strokeWidth="1" opacity="0.6" />
    <line x1="0" y1="-5" x2="4" y2="-2" stroke="#fff" strokeWidth="1" opacity="0.6" />
    {/* Heavy Wheels */}
    <circle cx="-12" cy="12" r="5" fill="#37474f" stroke="#263238" strokeWidth="1.5" />
    <circle cx="-12" cy="12" r="2.5" fill="#cfd8dc" />
    <circle cx="12" cy="12" r="5" fill="#37474f" stroke="#263238" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="2.5" fill="#cfd8dc" />
    {/* Headlight cone */}
    <polygon points="22,-6 50,-18 50,6 22,0" fill="rgba(255, 235, 59, 0.15)" />
    <circle cx="22" cy="-3" r="2" fill="#ffeb3b" />
  </g>
);

// Advanced Railroad Tracks Drawing
const RailroadTracksSVG = ({ startX, startY, endX, endY, tiesCount = 12 }) => {
  const ties = [];
  for (let i = 0; i <= tiesCount; i++) {
    const ratio = i / tiesCount;
    const x = startX + (endX - startX) * ratio;
    const y = startY + (endY - startY) * ratio;
    ties.push({ x, y });
  }

  return (
    <g>
      {/* Wood Cross-Ties (Sleepers) */}
      {ties.map((t, idx) => (
        <line
          key={idx}
          x1={t.x}
          y1={t.y - 8}
          x2={t.x}
          y2={t.y + 8}
          stroke="#5d4037"
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity="0.9"
        />
      ))}
      {/* Metal Rails */}
      <line x1={startX} y1={startY - 6} x2={endX} y2={endY - 6} stroke="#cfd8dc" strokeWidth="2.5" />
      <line x1={startX} y1={startY + 6} x2={endX} y2={endY + 6} stroke="#cfd8dc" strokeWidth="2.5" />
      <line x1={startX} y1={startY - 6} x2={endX} y2={endY - 6} stroke="#90a4ae" strokeWidth="1.2" />
      <line x1={startX} y1={startY + 6} x2={endX} y2={endY + 6} stroke="#90a4ae" strokeWidth="1.2" />
    </g>
  );
};

// Curved Railroad Tracks Drawing for Scenario 1
const CurvedRailroadTracksSVG = () => {
  const ties = [];
  
  // Segment 1: Bezier curve t = 0.42 to 1 (starts at x = 247 to avoid clutter at switch intersection)
  const curveTiesCount = 12;
  for (let i = 5; i <= curveTiesCount; i++) {
    const t = i / curveTiesCount;
    const x = (1 - t) * (1 - t) * 180 + 2 * (1 - t) * t * 260 + t * t * 320;
    const y = (1 - t) * (1 - t) * 90 + 2 * (1 - t) * t * 90 + t * t * 130;
    
    const dx = 160 - 40 * t;
    const dy = 80 * t;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    const nx = (-dy / length) * 8;
    const ny = (dx / length) * 8;
    
    ties.push({ x1: x - nx, y1: y - ny, x2: x + nx, y2: y + ny });
  }
  
  // Segment 2: Straight segment x = 320 to 430
  const straightTiesCount = 8;
  const startX = 320;
  const endX = 430;
  for (let i = 1; i <= straightTiesCount; i++) {
    const ratio = i / straightTiesCount;
    const x = startX + (endX - startX) * ratio;
    const y = 130;
    
    ties.push({ x1: x, y1: y - 8, x2: x, y2: y + 8 });
  }
  
  // Metal rails parallel curve coordinates (starts at t = 0.25 / sample 6 to merge smoothly with switch blade)
  const railPointsLeft = [];
  const railPointsRight = [];
  const samples = 24;
  for (let i = 6; i <= samples; i++) {
    const t = i / samples;
    const x = (1 - t) * (1 - t) * 180 + 2 * (1 - t) * t * 260 + t * t * 320;
    const y = (1 - t) * (1 - t) * 90 + 2 * (1 - t) * t * 90 + t * t * 130;
    
    const dx = 160 - 40 * t;
    const dy = 80 * t;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    const nx = (-dy / length) * 6;
    const ny = (dx / length) * 6;
    
    railPointsLeft.push(`${x - nx},${y - ny}`);
    railPointsRight.push(`${x + nx},${y + ny}`);
  }
  
  railPointsLeft.push("430,124");
  railPointsRight.push("430,136");
  
  const railPathLeft = "M " + railPointsLeft.join(" L ");
  const railPathRight = "M " + railPointsRight.join(" L ");
  
  return (
    <g>
      {/* Wooden Cross-Ties (Sleepers) */}
      {ties.map((t, idx) => (
        <line
          key={idx}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke="#5d4037"
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity="0.9"
        />
      ))}
      {/* Rail base shadows */}
      <path d={railPathLeft} fill="none" stroke="#5d4037" strokeWidth="5.5" strokeLinecap="round" opacity="0.4" />
      <path d={railPathRight} fill="none" stroke="#5d4037" strokeWidth="5.5" strokeLinecap="round" opacity="0.4" />
      {/* Metal Rails */}
      <path d={railPathLeft} fill="none" stroke="#cfd8dc" strokeWidth="2.5" />
      <path d={railPathRight} fill="none" stroke="#cfd8dc" strokeWidth="2.5" />
      <path d={railPathLeft} fill="none" stroke="#90a4ae" strokeWidth="1.2" />
      <path d={railPathRight} fill="none" stroke="#90a4ae" strokeWidth="1.2" />
    </g>
  );
};

// 5. Upgraded Trolley Problem Widget (SVG Track & Animation System)
export const TrolleyProblemWidget = () => {
  const [currentScenario, setCurrentScenario] = useState(1);
  const [answers, setAnswers] = useState({ 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null, 8: null, 9: null, 10: null });
  const [profilingDone, setProfilingDone] = useState(false);
  const [animationState, setAnimationState] = useState('idle'); // 'idle' | 'running' | 'complete'
  const [decision, setDecision] = useState(null); // 'yes' | 'no'
  const [smokeActive, setSmokeActive] = useState(false);

  const scenarios = [
    {
      id: 1,
      title: 'Scenario 1: The Switch',
      description: 'A runaway trolley is speeding down the tracks toward 5 workers who will be killed. You can pull a lever to divert it onto a side track where only 1 worker stands. Do you pull the lever, actively sacrificing 1 to save 5?',
      yesLabel: 'Yes (Pull Lever)',
      noLabel: 'No (Do Nothing)'
    },
    {
      id: 2,
      title: 'Scenario 2: The Footbridge',
      description: 'The trolley is speeding toward 5 workers. You are standing on a footbridge above the track next to a very large man. Pushing him off the bridge will block the trolley, killing him but saving the 5. Do you push the man?',
      yesLabel: 'Yes (Push Bystander)',
      noLabel: 'No (Do Nothing)'
    },
    {
      id: 3,
      title: 'Scenario 3: The Murderer at the Door',
      description: 'A murderer asks whether your friend is hiding in your house. Telling the truth will almost certainly lead to your friend\'s death, but lying violates your absolute duty to tell the truth. Do you lie to protect your friend?',
      yesLabel: 'Yes (Lie to Protect Friend)',
      noLabel: 'No (Tell the Truth)'
    },
    {
      id: 4,
      title: 'Scenario 4: The Self-Driving Car',
      description: 'A self-driving car carries 1 passenger. Brakes fail, and it is hurtling toward 5 pedestrians on a crosswalk. It can swerve into a concrete barrier (saving the 5 but killing its own passenger) or continue straight. Do you program it to swerve?',
      yesLabel: 'Yes (Swerve & Sacrifice Passenger)',
      noLabel: 'No (Continue Straight)'
    },
    {
      id: 5,
      title: 'Scenario 5: The Stolen Medicine',
      description: 'A parent cannot afford medicine that will save their dying child. The pharmacist refuses to lower the price or offer a payment plan. The parent has the opportunity to steal the medicine unnoticed. Should they steal it?',
      yesLabel: 'Yes (Steal the Medicine)',
      noLabel: 'No (Refuse to Steal)'
    },
    {
      id: 6,
      title: 'Scenario 6: The Lifeboat',
      description: 'A lifeboat can safely hold only 5 people, but 6 are aboard in a storm. If no one leaves, the boat will capsize and all 6 will drown. Active force is required to throw 1 person overboard to save the rest. Do you force someone overboard?',
      yesLabel: 'Yes (Force One Overboard)',
      noLabel: 'No (Do Nothing)'
    },
    {
      id: 7,
      title: 'Scenario 7: The Promise',
      description: 'You promised a dying friend that you would never reveal a secret. Years later, you realize that revealing it is the only way to prevent serious harm to many innocent people. Do you reveal the secret?',
      yesLabel: 'Yes (Reveal Secret to Prevent Harm)',
      noLabel: 'No (Keep the Promise)'
    },
    {
      id: 8,
      title: 'Scenario 8: The AI Hiring System',
      description: 'An AI hiring system is extremely accurate at predicting job success but slightly biased against one demographic group. Using it improves overall workforce efficiency but perpetuates systemic bias. Do you deploy it?',
      yesLabel: 'Yes (Deploy to Maximize Efficiency)',
      noLabel: 'No (Reject Biased System)'
    },
    {
      id: 9,
      title: 'Scenario 9: The Found Wallet',
      description: 'You find a wallet containing $2,000 cash and the owner\'s ID. No one saw you find it. You are in financial distress and could use the cash, but returning it preserves trust and helps the owner. Do you return the wallet?',
      yesLabel: 'Yes (Return the Wallet)',
      noLabel: 'No (Keep the Cash)'
    },
    {
      id: 10,
      title: 'Scenario 10: The Burning Museum',
      description: 'A fire breaks out in a museum. You only have time to save either a single trapped stranger who will otherwise perish, or a priceless collection of historical artifacts that enrich the cultural life of millions. Do you save the stranger?',
      yesLabel: 'Yes (Save the Stranger)',
      noLabel: 'No (Save the Artifacts)'
    }
  ];

  const handleChoice = (choice) => {
    setDecision(choice);
    setAnimationState('running');
    setAnswers(prev => ({ ...prev, [currentScenario]: choice }));

    setTimeout(() => {
      setAnimationState('complete');
      if (currentScenario === 10) {
        setSmokeActive(true);
        setTimeout(() => {
          setSmokeActive(false);
        }, 3000);
      }
    }, 2400);
  };

  const handleNext = () => {
    setAnimationState('idle');
    setDecision(null);
    setSmokeActive(false);
    if (currentScenario < 10) {
      setCurrentScenario(prev => prev + 1);
    } else {
      setProfilingDone(true);
    }
  };

  const calculateProfile = () => {
    let utilitarianCount = 0;
    if (answers[1] === 'yes') utilitarianCount++;
    if (answers[2] === 'yes') utilitarianCount++;
    if (answers[3] === 'yes') utilitarianCount++;
    if (answers[4] === 'yes') utilitarianCount++;
    if (answers[5] === 'yes') utilitarianCount++;
    if (answers[6] === 'yes') utilitarianCount++;
    if (answers[7] === 'yes') utilitarianCount++;
    if (answers[8] === 'yes') utilitarianCount++;
    if (answers[9] === 'no') utilitarianCount++;
    if (answers[10] === 'no') utilitarianCount++;

    const utilitarianPct = Math.round((utilitarianCount / 10) * 100);
    const deontologyPct = 100 - utilitarianPct;

    let profileTitle = '';
    let profileDesc = '';

    if (utilitarianPct >= 80) {
      profileTitle = 'Strong Consequentialist / Utilitarian';
      profileDesc = 'You consistently prioritize the greatest good for the greatest number. You believe that the moral worth of an action is determined by its consequences, valuing net lives saved, public welfare, and long-term societal utility above absolute rules, direct action constraints, or personal promises.';
    } else if (utilitarianPct <= 30) {
      profileTitle = 'Strong Deontologist / Kantian';
      profileDesc = 'You strictly adhere to absolute moral duties and rules. You believe that actively harming an innocent person, lying, stealing, or breaking promises is fundamentally wrong and can never be justified by positive outcomes, regardless of the scale of potential benefits.';
    } else {
      profileTitle = 'Contextual Pluralist';
      profileDesc = 'You balance rules and consequences depending on context. You distinguish between direct harm (pushing a bystander, harvesting organs, or forcing someone overboard) and indirect consequences (diverting a car/train, stealing out of survival necessity, or breaking minor promises to avert major disasters).';
    }

    return { utilitarianPct, deontologyPct, profileTitle, profileDesc };
  };

  const handleReset = () => {
    setCurrentScenario(1);
    setAnswers({ 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null, 8: null, 9: null, 10: null });
    setProfilingDone(false);
    setAnimationState('idle');
    setDecision(null);
    setSmokeActive(false);
  };

  const trolleyX = decision === 'yes' 
    ? [30, 60, 90, 120, 150, 180, 215, 250, 285, 320, 350, 380] 
    : [30, 60, 90, 120, 150, 180, 215, 250, 285, 320, 350, 380];
  const trolleyY = decision === 'yes' 
    ? [90, 90, 90, 90, 90, 90, 92, 99, 111, 130, 130, 130] 
    : [90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90];
  const trolleyRotate = decision === 'yes' 
    ? [0, 0, 0, 0, 0, 0, 7, 15, 24, 34, 15, 0] 
    : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const trolleyTimes = [0, 0.084, 0.169, 0.253, 0.337, 0.422, 0.521, 0.620, 0.723, 0.831, 0.916, 1.0];

  return (
    <Paper className="glass-panel" style={{ padding: '24px', margin: '20px 0', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Ethics Lab: Moral Framework Profiler
      </Typography>

      {!profilingDone ? (
        <Box>
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <Typography variant="caption" style={{ fontWeight: 800, color: 'var(--primary-main)' }}>
              Scenario {currentScenario} of 10
            </Typography>
            <Typography variant="caption" style={{ color: 'var(--text-secondary)', fontWeight: 800 }}>
              {currentScenario === 1 ? "SWITCH Y/N" 
               : currentScenario === 2 ? "FOOTBRIDGE Y/N" 
               : currentScenario === 3 ? "MURDERER Y/N" 
               : currentScenario === 4 ? "SELF-DRIVING Y/N" 
               : currentScenario === 5 ? "MEDICINE Y/N" 
               : currentScenario === 6 ? "LIFEBOAT Y/N" 
               : currentScenario === 7 ? "PROMISE Y/N" 
               : currentScenario === 8 ? "AI HIRING Y/N" 
               : currentScenario === 9 ? "WALLET Y/N" 
               : "MUSEUM Y/N"}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(currentScenario / 10) * 100} 
            style={{ marginBottom: '20px', borderRadius: '4px', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)' }} 
          />

          <Typography variant="subtitle1" style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
            {scenarios[currentScenario - 1].title}
          </Typography>
          <Typography variant="body2" style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
            {scenarios[currentScenario - 1].description}
          </Typography>

          <Box style={{ width: '100%', height: '280px', backgroundColor: 'rgba(128,128,128,0.08)', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.15)', position: 'relative', overflow: 'hidden', marginBottom: '20px' }}>
            
            {currentScenario === 1 && (
              <svg viewBox="0 0 450 180" width="100%" height="100%" style={{ overflow: "hidden" }}>
                <RailroadTracksSVG startX={20} startY={90} endX={430} endY={90} tiesCount={16} />
                <CurvedRailroadTracksSVG />
                <motion.line
                  x1="180" y1="90" x2="220" y2={decision === 'yes' ? 98 : 90}
                  stroke="#cfd8dc"
                  strokeWidth="3.5"
                  animate={{ y2: decision === 'yes' ? 98 : 90 }}
                  transition={{ duration: 0.5 }}
                />
                <StickFigure x={380} y={90} color={animationState === 'complete' && decision === 'no' ? '#ff5252' : 'var(--text-primary)'} isDead={animationState === 'complete' && decision === 'no'} scale={0.6} />
                <StickFigure x={395} y={75} color={animationState === 'complete' && decision === 'no' ? '#ff5252' : 'var(--text-primary)'} isDead={animationState === 'complete' && decision === 'no'} scale={0.6} />
                <StickFigure x={395} y={105} color={animationState === 'complete' && decision === 'no' ? '#ff5252' : 'var(--text-primary)'} isDead={animationState === 'complete' && decision === 'no'} scale={0.6} />
                <StickFigure x={410} y={83} color={animationState === 'complete' && decision === 'no' ? '#ff5252' : 'var(--text-primary)'} isDead={animationState === 'complete' && decision === 'no'} scale={0.6} />
                <StickFigure x={410} y={97} color={animationState === 'complete' && decision === 'no' ? '#ff5252' : 'var(--text-primary)'} isDead={animationState === 'complete' && decision === 'no'} scale={0.6} />
                <StickFigure x={380} y={130} color={animationState === 'complete' && decision === 'yes' ? '#ff5252' : 'var(--text-primary)'} isDead={animationState === 'complete' && decision === 'yes'} scale={0.6} />

                <g transform="translate(180, 50)" style={{ cursor: 'pointer' }} onClick={() => { if (animationState === 'idle') handleChoice('yes'); }}>
                  <rect x="-14" y="-2" width="28" height="12" rx="3" fill="#37474f" stroke="#263238" strokeWidth="1" />
                  <motion.line
                    x1="0" y1="4" x2={decision === 'yes' ? 14 : -14} y2="-12"
                    stroke={decision === null ? "var(--text-secondary)" : decision === 'yes' ? "#4CAF50" : "#ff5252"}
                    strokeWidth="4"
                    strokeLinecap="round"
                    animate={animationState === 'running' ? { x2: decision === 'yes' ? 14 : -14, y2: -12 } : {}}
                  />
                  <circle cx={decision === 'yes' ? 14 : -14} cy="-12" r="5" fill={decision === 'yes' ? '#4CAF50' : '#cfd8dc'} />
                  <text x="-12" y="-18" fill="var(--text-secondary)" fontSize="8" fontWeight="800">PULL LEVER</text>
                </g>

                <motion.g
                  initial={{ x: 30, y: 90, rotate: 0 }}
                  animate={
                    animationState === 'running'
                      ? { x: trolleyX, y: trolleyY, rotate: trolleyRotate }
                      : animationState === 'complete'
                      ? { x: 380, y: decision === 'yes' ? 130 : 90, rotate: 0 }
                      : { x: 30, y: 90, rotate: 0 }
                  }
                  transition={{ duration: 2.0, ease: "linear", times: trolleyTimes }}
                >
                  <AdvancedTrolleySVG />
                </motion.g>
              </svg>
            )}

            {currentScenario === 2 && (
              <svg viewBox="0 0 450 200" width="100%" height="100%" style={{ overflow: "hidden" }}>
                <defs>
                  <linearGradient id="skyGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a1a2e" />
                    <stop offset="100%" stopColor="#16213e" />
                  </linearGradient>
                  <linearGradient id="groundGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3d4b52" />
                    <stop offset="100%" stopColor="#263238" />
                  </linearGradient>
                </defs>
                {/* Sky background */}
                <rect x="0" y="0" width="450" height="200" fill="url(#skyGrad2)" />
                {/* Stars */}
                {[{x:30,y:15},{x:80,y:8},{x:150,y:20},{x:220,y:6},{x:300,y:18},{x:380,y:10},{x:420,y:22}].map((s,i) => (
                  <motion.circle key={i} cx={s.x} cy={s.y} r="1.2" fill="#fff" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }} />
                ))}
                {/* Ground/Road */}
                <rect x="0" y="155" width="450" height="45" fill="url(#groundGrad2)" />
                <line x1="0" y1="155" x2="450" y2="155" stroke="#546e7a" strokeWidth="2" />
                {/* Railroad tracks on ground */}
                <RailroadTracksSVG startX={20} startY={162} endX={430} endY={162} tiesCount={16} />
                {/* Bridge structure - vertical pillars */}
                <rect x="168" y="72" width="8" height="83" fill="#546e7a" />
                <rect x="274" y="72" width="8" height="83" fill="#546e7a" />
                {/* Bridge cables going up */}
                <line x1="172" y1="72" x2="225" y2="35" stroke="#78909c" strokeWidth="1.5" opacity="0.8" />
                <line x1="278" y1="72" x2="225" y2="35" stroke="#78909c" strokeWidth="1.5" opacity="0.8" />
                <line x1="172" y1="80" x2="225" y2="42" stroke="#78909c" strokeWidth="1" opacity="0.5" />
                <line x1="278" y1="80" x2="225" y2="42" stroke="#78909c" strokeWidth="1" opacity="0.5" />
                {/* Cable tower top */}
                <rect x="220" y="30" width="10" height="60" fill="#607d8b" />
                <rect x="215" y="28" width="20" height="6" rx="2" fill="#78909c" />
                {/* Bridge deck/walkway */}
                <rect x="165" y="68" width="120" height="10" rx="2" fill="#607d8b" stroke="#546e7a" strokeWidth="1.5" />
                {/* Bridge railings */}
                {[175,190,205,220,235,250,265].map((x,i) => (
                  <line key={i} x1={x} y1="64" x2={x} y2="78" stroke="#78909c" strokeWidth="1.2" />
                ))}
                <line x1="172" y1="64" x2="280" y2="64" stroke="#90a4ae" strokeWidth="1.5" />
                {/* Moon */}
                <circle cx="400" cy="25" r="14" fill="#eceff1" />
                <circle cx="408" cy="22" r="11" fill="#16213e" />
                {/* YOU figure on bridge - highlighted in green, standing on top of bridge walkway */}
                <StickFigure x={252} y={63} color="#4CAF50" bg="#16213e" scale={0.85} />
                <text x="244" y="32" fill="#4CAF50" fontSize="7" fontWeight="800">YOU</text>
                {/* LARGE MAN (target to push) */}
                <motion.g
                  initial={{ x: 217, y: 63 }}
                  animate={
                    animationState === 'running' && decision === 'yes'
                      ? { x: [217, 217, 217], y: [63, 63, 157], rotate: [0, 30, 90] }
                      : animationState === 'complete' && decision === 'yes'
                      ? { x: 217, y: 157, rotate: 90 }
                      : { x: 217, y: 63 }
                  }
                  transition={{ duration: 2.0, times: [0, 0.4, 1.0], ease: "easeInOut" }}
                  style={{ cursor: animationState === 'idle' ? 'pointer' : 'default' }}
                  onClick={() => { if (animationState === 'idle') handleChoice('yes'); }}
                >
                  {/* Large man (bigger head & body, opaque head to prevent background lines showing through) */}
                  <circle cx="0" cy="-26" r="8" fill="#16213e" stroke={animationState === 'complete' && decision === 'yes' ? '#ff5252' : '#2196F3'} strokeWidth="2.5" />
                  <line x1="0" y1="-18" x2="0" y2="-2" stroke={animationState === 'complete' && decision === 'yes' ? '#ff5252' : '#2196F3'} strokeWidth="3" />
                  <line x1="-10" y1="-12" x2="10" y2="-12" stroke={animationState === 'complete' && decision === 'yes' ? '#ff5252' : '#2196F3'} strokeWidth="3" />
                  <line x1="0" y1="-2" x2="-7" y2="10" stroke={animationState === 'complete' && decision === 'yes' ? '#ff5252' : '#2196F3'} strokeWidth="3" />
                  <line x1="0" y1="-2" x2="7" y2="10" stroke={animationState === 'complete' && decision === 'yes' ? '#ff5252' : '#2196F3'} strokeWidth="3" />
                  {animationState === 'complete' && decision === 'yes' && (
                    <path d="M -7,-30 L 7,-14 M 7,-30 L -7,-14" stroke="#ff5252" strokeWidth="2.5" />
                  )}
                  {animationState === 'idle' && (
                    <text x="-20" y="-38" fill="#2196F3" fontSize="7" fontWeight="800">PUSH?</text>
                  )}
                </motion.g>
                {/* 5 workers at track end with crowd effect */}
                {[{x:360,y:157},{x:375,y:150},{x:375,y:164},{x:390,y:153},{x:390,y:162}].map((pos,i) => (
                  <StickFigure key={i} x={pos.x} y={pos.y}
                    color={animationState === 'complete' && decision === 'no' ? '#ff5252' : 'var(--text-primary)'}
                    isDead={animationState === 'complete' && decision === 'no'} scale={0.55} bg="#263238" />
                ))}
                <text x="349" y="140" fill="var(--text-secondary)" fontSize="6.5" fontWeight="800">5 WORKERS</text>
                {/* Trolley on ground track */}
                <motion.g
                  initial={{ x: 30, y: 152 }}
                  animate={animationState === 'running'
                    ? { x: decision === 'yes' ? [30, 210] : [30, 360] }
                    : animationState === 'complete'
                    ? { x: decision === 'yes' ? 210 : 360, y: 152 }
                    : { x: 30, y: 152 }}
                  transition={{ duration: 2.0, ease: "easeInOut" }}
                >
                  <AdvancedTrolleySVG />
                </motion.g>
                {/* Trolley blocking glow when stopped */}
                {animationState === 'complete' && decision === 'yes' && (
                  <motion.circle cx={217} cy={162} r="12" fill="#ff5252" initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.5, 1], opacity: [0, 0.6, 0] }} transition={{ duration: 0.8 }} />
                )}
              </svg>
            )}

            {currentScenario === 3 && (
              <svg viewBox="0 0 450 200" width="100%" height="100%" style={{ overflow: "hidden" }}>
                <defs>
                  <radialGradient id="lampGlow3" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffeb3b" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#ffeb3b" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="nightSky3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d1117" />
                    <stop offset="70%" stopColor="#161b22" />
                    <stop offset="100%" stopColor="#1c2128" />
                  </linearGradient>
                </defs>
                {/* Night sky */}
                <rect x="0" y="0" width="450" height="200" fill="url(#nightSky3)" />
                {/* Stars */}
                {[{x:20,y:12},{x:60,y:5},{x:110,y:18},{x:180,y:8},{x:240,y:14},{x:310,y:6},{x:370,y:20},{x:415,y:10}].map((s,i) => (
                  <motion.circle key={i} cx={s.x} cy={s.y} r="1" fill="#fff" animate={{ opacity: [0.2, 0.9, 0.2] }} transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.2 }} />
                ))}
                {/* Ground / sidewalk */}
                <rect x="0" y="158" width="450" height="42" fill="#1c2128" />
                <rect x="0" y="158" width="450" height="4" fill="#30363d" />
                {/* Street lamp */}
                <line x1="35" y1="158" x2="35" y2="60" stroke="#484f58" strokeWidth="3.5" />
                <path d="M 35,60 Q 35,48 55,48" fill="none" stroke="#484f58" strokeWidth="3.5" />
                <ellipse cx="55" cy="48" rx="10" ry="5" fill="#ffeb3b" opacity="0.9" />
                <ellipse cx="55" cy="48" rx="25" ry="20" fill="url(#lampGlow3)" />
                {/* House exterior - right side */}
                <rect x="270" y="60" width="160" height="100" fill="#161b22" stroke="#21262d" strokeWidth="2" />
                <rect x="270" y="55" width="160" height="10" fill="#21262d" />
                {/* House roof peak */}
                <polygon points="265,62 350,20 435,62" fill="#21262d" stroke="#30363d" strokeWidth="2" />
                
                {/* Window with warm interior light */}
                <rect x="290" y="80" width="35" height="28" rx="2" fill="#332200" />
                <rect x="292" y="82" width="31" height="24" rx="1" fill="#ffcc44" opacity="0.3" />
                <line x1="309" y1="82" x2="309" y2="106" stroke="#554400" strokeWidth="1.5" />
                <line x1="292" y1="94" x2="323" y2="94" stroke="#554400" strokeWidth="1.5" />
                
                {/* FRIEND figure visible through window outline (behind the window not on the wall) */}
                <StickFigure x={308} y={104} color={animationState === 'complete' && decision === 'no' ? '#ff5252' : '#2196F3'} isDead={animationState === 'complete' && decision === 'no'} scale={0.6} bg="none" />
                
                {/* Inside Murderer figure beside friend when decision is NO */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={animationState === 'complete' && decision === 'no' ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <StickFigure x={296} y={104} color="#d32f2f" scale={0.6} bg="none" />
                </motion.g>

                {/* Main door */}
                <rect x="335" y="108" width="40" height="52" rx="3" fill="#4a2c00" stroke="#30363d" strokeWidth="2" />
                <rect x="339" y="112" width="32" height="44" rx="2" fill="#3d2400" />
                {/* Door crack of light - shows friend is inside */}
                <line x1="375" y1="109" x2="375" y2="159" stroke="#ffcc44" strokeWidth="1.5" opacity="0.5" />
                {/* Door knocker */}
                <circle cx="355" cy="134" r="3" fill="#90a4ae" />
                
                {/* Outside MURDERER figure approaching door, then entering */}
                <motion.g
                  initial={{ x: 60, y: 158, opacity: 1 }}
                  animate={
                    animationState === 'running' && decision === 'no'
                      ? { x: [60, 355, 355], opacity: [1, 1, 0] }
                      : animationState === 'complete' && decision === 'no'
                      ? { x: 355, opacity: 0 }
                      : { x: 60, opacity: 1 }
                  }
                  transition={{ duration: 1.8, times: [0, 0.8, 1.0], ease: "easeInOut" }}
                >
                  <StickFigure x={0} y={0} color="#d32f2f" scale={0.9} bg="#161b22" />
                  {/* Weapon: a proper little knife in hand */}
                  <g transform="translate(4, -13)">
                    <line x1="0" y1="0" x2="3" y2="-3" stroke="#5d4037" strokeWidth="1.2" />
                    <path d="M 2,-2 L 8,-8 L 9,-7 L 3,-1 Z" fill="#cfd8dc" stroke="#90a4ae" strokeWidth="0.5" />
                  </g>
                  <text x="-28" y="-40" fill="#ff5252" fontSize="7" fontWeight="900">MURDERER</text>
                </motion.g>
                
                {/* YOU figure standing near house */}
                <StickFigure x={200} y={158} color="#4CAF50" bg="#161b22" scale={0.9} />
                <text x="192" y="124" fill="#4CAF50" fontSize="7" fontWeight="800">YOU</text>
                
                {/* Speech bubble from YOU after decision */}
                {animationState === 'complete' && (
                  <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
                    <rect x="200" y="112" width="72" height="24" rx="6" fill="#fff" />
                    <polygon points="208,136 200,144 216,136" fill="#fff" />
                    <text x="207" y="124" fill="#1a1a2e" fontSize="8" fontWeight="bold">
                      {decision === 'yes' ? "He's not here!" : "He is inside."}
                    </text>
                  </motion.g>
                )}
                
                <text x="307" y="76" fill="#2196F3" fontSize="6.5" fontWeight="800">FRIEND</text>
                {/* Moonlight */}
                <circle cx="410" cy="28" r="16" fill="#eceff1" />
                <circle cx="420" cy="24" r="13" fill="#0d1117" />
              </svg>
            )}

            {currentScenario === 4 && (
              <svg viewBox="0 0 450 200" width="100%" height="100%" style={{ overflow: "hidden" }}>
                <defs>
                  <linearGradient id="roadGrad4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#37474f" />
                    <stop offset="100%" stopColor="#263238" />
                  </linearGradient>
                  <linearGradient id="skyDay4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1565c0" />
                    <stop offset="100%" stopColor="#42a5f5" />
                  </linearGradient>
                  <radialGradient id="headlightCone4" cx="0%" cy="50%" r="100%">
                    <stop offset="0%" stopColor="#fff59d" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#fff59d" stopOpacity="0" />
                  </radialGradient>
                  <clipPath id="skyClip4">
                    <rect x="0" y="0" width="450" height="95" />
                  </clipPath>
                </defs>
                {/* Sky */}
                <rect x="0" y="0" width="450" height="95" fill="url(#skyDay4)" />
                {/* Clouds (clipped to sky width to slice at borders) */}
                <g clipPath="url(#skyClip4)">
                  <motion.g animate={{ x: [-80, 510] }} transition={{ repeat: Infinity, duration: 50, ease: "linear" }}>
                    <path d="M -30,45 C -18,32 2,32 12,42 C 22,32 40,32 52,45 C 60,40 75,50 68,60 C 61,70 -22,70 -26,60 C -32,50 -36,46 -30,45 Z" fill="#fff" opacity="0.7" />
                  </motion.g>
                  <motion.g animate={{ x: [-100, 500] }} transition={{ repeat: Infinity, duration: 70, ease: "linear" }}>
                    <path d="M -20,30 C -10,20 8,20 16,28 C 24,20 38,20 48,30 C 56,26 66,34 62,42 C 57,50 -15,50 -18,42 C -22,34 -26,30 -20,30 Z" fill="#fff" opacity="0.5" />
                  </motion.g>
                </g>
                {/* Road surface */}
                <rect x="0" y="95" width="450" height="105" fill="url(#roadGrad4)" />
                <line x1="0" y1="95" x2="450" y2="95" stroke="#fff" strokeWidth="3" />
                <line x1="0" y1="190" x2="450" y2="190" stroke="#fff" strokeWidth="3" />
                {/* Lane dashes */}
                {[0,1,2,3,4,5].map(i => (
                  <rect key={i} x={i * 60} y="138" width="35" height="3" fill="rgba(255,255,255,0.5)" rx="1" />
                ))}
                {/* Last segment of the road's center line after crosswalk (ends at 445, under 450 sky limit) */}
                <rect x="425" y="138" width="20" height="3" fill="rgba(255,255,255,0.5)" rx="1" />
                {/* Crosswalk at right - 5 pedestrians */}
                <rect x="345" y="95" width="75" height="95" fill="rgba(255,255,255,0.04)" />
                {[95,110,126,141,157].map((y,i) => (
                  <rect key={i} x="345" y={y} width="75" height="8" fill="rgba(255,255,255,0.12)" />
                ))}
                <text x="355" y="86" fill="#ffffff" fontSize="8" fontWeight="900" style={{ letterSpacing: '0.5px' }}>CROSSWALK</text>
                {[{x:360,y:143},{x:375,y:130},{x:380,y:155},{x:395,y:138},{x:393,y:160}].map((pos,i) => (
                  <StickFigure key={i} x={pos.x} y={pos.y}
                    color={animationState === 'complete' && decision === 'no' ? '#ff5252' : 'var(--text-primary)'}
                    isDead={animationState === 'complete' && decision === 'no'} scale={0.55} bg="#37474f" />
                ))}
                <text x="355" y="180" fill="#ffffff" fontSize="8" fontWeight="900" style={{ letterSpacing: '0.5px' }}>5 PEDESTRIANS</text>
                {/* Concrete barrier - realistic Jersey barrier shape with warning light and safety hazard stripes */}
                <polygon points="226,123 232,105 262,105 268,123" fill="#90a4ae" stroke="#78909c" strokeWidth="1.5" />
                <polygon points="232,123 238,105 244,105 238,123" fill="#ff9800" />
                <polygon points="244,123 250,105 256,105 250,123" fill="#ff9800" />
                <polygon points="256,123 260,105 262,105 268,123" fill="#ff9800" />
                <text x="225" y="134" fill="#ffd54f" fontSize="8" fontWeight="900" style={{ letterSpacing: '0.5px' }}>BARRIER</text>
                
                {/* Self-driving car - proper sedan car shape moving forward (right) */}
                <motion.g
                  initial={{ x: 70, y: 162 }}
                  animate={
                    animationState === 'running' && decision === 'yes'
                      ? { x: [70, 140, 225], y: [162, 138, 114] }
                      : animationState === 'complete' && decision === 'yes'
                      ? { x: 225, y: 114 }
                      : animationState === 'running' && decision === 'no'
                      ? { x: [70, 330], y: [162, 162] }
                      : animationState === 'complete' && decision === 'no'
                      ? { x: 330, y: 162 }
                      : { x: 70, y: 162 }
                  }
                  transition={{ duration: 2.0, ease: "linear" }}
                >
                  {/* Car body - forward-facing sedan */}
                  <path d="M -28,14 L -28,2 L -22,2 L -12,-12 L 8,-12 L 18,2 L 28,2 L 28,14 Z" fill="#1565c0" stroke="#0d47a1" strokeWidth="2" />
                  {/* Windows */}
                  <path d="M -10,-10 L -20,0 L -12,0 L -8,-10 Z" fill="#e3f2fd" opacity="0.9" />
                  <path d="M -6,-10 L -4,0 L 14,0 L 8,-10 Z" fill="#e3f2fd" opacity="0.9" />
                  {/* AI sensor dome on top - police car alarm light shape, squeezed horizontally */}
                  <path d="M -4,-12 L -3,-18 Q 0,-20 3,-18 L 4,-12 Z" fill="#29b6f6" stroke="#0288d1" strokeWidth="1.5" />
                  <motion.ellipse cx="0" cy="-15" rx="5" ry="3.5" fill="none" stroke="#29b6f6" strokeWidth="1" animate={{ scale: [1, 1.8], opacity: [0.6, 0] }} transition={{ repeat: Infinity, duration: 1.2 }} />
                  {/* Headlights cone */}
                  <polygon points="28,1 70,-15 70,23 28,7" fill="url(#headlightCone4)" />
                  <circle cx="28" cy="4" r="3" fill="#ffeb3b" />
                  {/* Wheels */}
                  <circle cx="-16" cy="14" r="6" fill="#37474f" stroke="#263238" strokeWidth="1.5" />
                  <circle cx="-16" cy="14" r="3" fill="#b0bec5" />
                  <circle cx="16" cy="14" r="6" fill="#37474f" stroke="#263238" strokeWidth="1.5" />
                  <circle cx="16" cy="14" r="3" fill="#b0bec5" />
                  <text x="-38" y="-24" fill="#29b6f6" fontSize="7.5" fontWeight="900" style={{ letterSpacing: '0.5px' }}>AI CAR</text>
                </motion.g>
                {/* Crash explosion */}
                {animationState === 'complete' && decision === 'yes' && (
                  <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.5, 1.2], opacity: [0, 1, 0.8] }} transition={{ duration: 0.7 }}>
                    <path d="M 248,112 L 260,90 L 266,107 L 285,100 L 268,118 L 279,130 L 258,120 L 248,135 L 250,112 Z" fill="#ffeb3b" />
                    <path d="M 253,115 L 263,97 L 268,111 L 282,105 L 267,120 L 276,130 L 258,122 L 250,132 L 253,115 Z" fill="#ff8f00" opacity="0.7" />
                  </motion.g>
                )}
              </svg>
            )}

            {currentScenario === 5 && (
              <svg viewBox="0 0 450 200" width="100%" height="100%" style={{ overflow: "hidden" }}>
                <defs>
                  <linearGradient id="pharmBg5" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f1923" />
                    <stop offset="100%" stopColor="#1a2535" />
                  </linearGradient>
                  <radialGradient id="beamLight5" cx="50%" cy="0%" r="100%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* Background */}
                <rect x="0" y="0" width="450" height="200" fill="url(#pharmBg5)" />
                {/* Shelves in window */}
                {[72,87,102].map((y,i) => (
                  <g key={i}>
                    <line x1="245" y1={y} x2="315" y2={y} stroke="#0d47a1" strokeWidth="1.5" />
                    {[252,265,278,291,302].map((x,j) => (
                      <rect key={j} x={x} y={y-10} width="7" height="9" rx="1" fill={['#ef9a9a','#90caf9','#a5d6a7','#fff176','#ce93d8'][j]} />
                    ))}
                  </g>
                ))}

                {/* Pharmacist behind counter */}
                <rect x="350" y="90" width="70" height="80" fill="rgba(255,255,255,0.02)" />
                <StickFigure x={390} y={153} color="var(--text-secondary)" bg="#1a2535" scale={1.1} />
                {/* Counter table */}
                <rect x="355" y="138" width="80" height="8" rx="1" fill="#21262d" stroke="#30363d" strokeWidth="1" />
                <rect x="360" y="130" width="20" height="10" rx="1" fill="#30363d" />
                <text x="360" y="88" fill="var(--text-secondary)" fontSize="7" fontWeight="800">PHARMACIST</text>
                {/* PRICE TAG */}
                <rect x="375" y="100" width="38" height="18" rx="3" fill="#f44336" />
                <text x="380" y="113" fill="#fff" fontSize="9" fontWeight="900">$850</text>
                
                {/* Pharmacy shop exterior wall and door frame rendered IN FRONT of table */}
                <rect x="230" y="20" width="200" height="140" fill="none" stroke="#29b6f6" strokeWidth="1.5" />
                <rect x="230" y="20" width="200" height="30" fill="#0d47a1" />
                <text x="263" y="42" fill="#fff" fontSize="11" fontWeight="900">💊 PHARMACY</text>
                <rect x="330" y="100" width="40" height="60" rx="2" fill="none" stroke="#29b6f6" strokeWidth="2.5" />
                <circle cx="342" cy="130" r="3" fill="#90a4ae" />
                <rect x="240" y="60" width="80" height="70" rx="2" fill="none" stroke="#42a5f5" strokeWidth="1.5" />
                
                {/* Sick child bed - left side */}
                <rect x="10" y="130" width="80" height="40" rx="4" fill="#1e3a4a" stroke="#29b6f6" strokeWidth="1" />
                <rect x="10" y="128" width="80" height="12" rx="4" fill="#263238" />
                
                {/* Lying child - fully detailed small person */}
                <circle cx="28" cy="142" r="5" fill="#ffcc80" />
                <line x1="28" y1="147" x2="52" y2="147" stroke="#ffcc80" strokeWidth="2.5" />
                <rect x="33" y="140" width="45" height="20" rx="3" fill="#37474f" stroke="#4f5b66" strokeWidth="1" />
                
                {/* Heart monitor line */}
                <motion.path
                  d={animationState === 'complete' && decision === 'no'
                    ? "M 15,120 L 80,120"
                    : "M 15,120 L 30,120 L 35,108 L 40,128 L 45,108 L 50,120 L 80,120"}
                  fill="none"
                  stroke={animationState === 'complete' && decision === 'no' ? '#ff5252' : '#4CAF50'}
                  strokeWidth="2"
                  animate={{ strokeDashoffset: [80, 0] }}
                  style={{ strokeDasharray: 80 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <text x="18" y="100" fill="#29b6f6" fontSize="6.5" fontWeight="800">SICK CHILD</text>
                
                {/* PARENT figure (YOU) - bigger scale */}
                <motion.g
                  initial={{ x: 110, y: 158 }}
                  animate={
                    animationState === 'running' && decision === 'yes'
                      ? { x: [110, 240, 100], y: [158, 140, 158] }
                      : animationState === 'complete' && decision === 'yes'
                      ? { x: 100, y: 158 }
                      : { x: 110, y: 158 }
                  }
                  transition={{ duration: 2.0 }}
                >
                  <StickFigure x={0} y={0} color="#4CAF50" bg="#1a2535" scale={1.05} />
                  <text x="-14" y="-30" fill="#4CAF50" fontSize="7" fontWeight="800">PARENT</text>
                  
                  {/* Small medicine bottle that travels in parent's hand */}
                  {animationState === 'running' && decision === 'yes' && (
                    <motion.g
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0, 1, 1] }}
                      transition={{ duration: 2.0, times: [0, 0.45, 0.55, 1.0] }}
                    >
                      <rect x="8" y="-12" width="6" height="10" rx="1.5" fill="#00e676" stroke="#00c853" strokeWidth="1" />
                      <rect x="10.5" y="-15" width="1" height="3" fill="#00c853" />
                    </motion.g>
                  )}
                  {animationState === 'complete' && decision === 'yes' && (
                    <g>
                      <rect x="8" y="-12" width="6" height="10" rx="1.5" fill="#00e676" stroke="#00c853" strokeWidth="1" />
                      <rect x="10.5" y="-15" width="1" height="3" fill="#00c853" />
                    </g>
                  )}
                </motion.g>
                <line x1="0" y1="170" x2="450" y2="170" stroke="#21262d" strokeWidth="2" />
              </svg>
            )}

            {currentScenario === 6 && (
              <svg viewBox="0 0 450 200" width="100%" height="100%" style={{ overflow: "hidden" }}>
                <defs>
                  <linearGradient id="daySky6" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a0c4ff" />
                    <stop offset="60%" stopColor="#c4e0e5" />
                    <stop offset="100%" stopColor="#e0f7fa" />
                  </linearGradient>
                  <linearGradient id="deepOcean6" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d3b5e" />
                    <stop offset="100%" stopColor="#051624" />
                  </linearGradient>
                  <clipPath id="skyClip6">
                    <rect x="0" y="0" width="450" height="200" />
                  </clipPath>
                </defs>
                {/* Daylight sky filling the canvas */}
                <rect x="0" y="0" width="450" height="200" fill="url(#daySky6)" />
                
                {/* White moving clouds (clipped to sky width to slice at borders) */}
                <g clipPath="url(#skyClip6)" opacity="0.8">
                  <motion.g animate={{ x: [-80, 510] }} transition={{ repeat: Infinity, duration: 40, ease: "linear" }}>
                    <path d="M -40,30 C -30,15 -10,15 0,25 C 10,15 30,15 40,30 C 50,25 65,35 60,45 C 55,55 -30,55 -35,45 C -40,35 -45,30 -40,30 Z" fill="#ffffff" />
                  </motion.g>
                  <motion.g animate={{ x: [-100, 500] }} transition={{ repeat: Infinity, duration: 55, ease: "linear" }}>
                    <path d="M -50,20 C -40,5 -20,5 -10,15 C 0,5 20,5 30,20 C 40,15 55,25 50,35 C 45,45 -40,45 -45,35 C -50,25 -55,20 -50,20 Z" fill="#ffffff" opacity="0.85" />
                  </motion.g>
                </g>

                {/* Ocean waves - clipped to sky width */}
                <g clipPath="url(#skyClip6)">
                  {/* Ocean waves - back layer */}
                  <motion.path
                    d="M -100,115 C 0,100 100,128 200,115 C 300,100 400,128 550,115 L 550,200 L -100,200 Z"
                    fill="url(#deepOcean6)"
                    animate={{ d: [
                      "M -100,115 C 0,100 100,128 200,115 C 300,100 400,128 550,115 L 550,200 L -100,200 Z",
                      "M -100,122 C 0,110 100,132 200,120 C 300,110 400,132 550,120 L 550,200 L -100,200 Z",
                      "M -100,108 C 0,95 100,120 200,108 C 300,95 400,120 550,108 L 550,200 L -100,200 Z",
                      "M -100,115 C 0,100 100,128 200,115 C 300,100 400,128 550,115 L 550,200 L -100,200 Z"
                    ]}}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  {/* Ocean waves - front layer */}
                  <motion.path
                    d="M -100,125 C -50,138 50,115 150,128 C 250,140 350,118 550,130 L 550,200 L -100,200 Z"
                    fill="#093152"
                    animate={{ d: [
                      "M -100,125 C -50,138 50,115 150,128 C 250,140 350,118 550,130 L 550,200 L -100,200 Z",
                      "M -100,118 C -50,130 50,108 150,120 C 250,132 350,112 550,122 L 550,200 L -100,200 Z",
                      "M -100,130 C -50,142 50,120 150,134 C 250,146 350,124 550,136 L 550,200 L -100,200 Z",
                      "M -100,125 C -50,138 50,115 150,128 C 250,140 350,118 550,130 L 550,200 L -100,200 Z"
                    ]}}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </g>
                
                {/* Actual ship rocking on waves (Greek Theseus sailboat styling) */}
                <motion.g
                  initial={{ x: 100, y: 95 }}
                  animate={
                    animationState === 'complete' && decision === 'no'
                      ? { x: 100, y: 145, rotate: -15, opacity: 0.5 }
                      : { x: 100, y: [95, 90, 96, 90, 95], rotate: [0, 2.5, -2, 2.5, 0] }
                  }
                  transition={{ repeat: animationState === 'complete' && decision === 'no' ? 0 : Infinity, duration: 3 }}
                >
                  {/* Rigging stays */}
                  <line x1="10" y1="-40" x2="-45" y2="20" stroke="#a1887f" strokeWidth="1.2" opacity="0.6" />
                  <line x1="10" y1="-40" x2="65" y2="20" stroke="#a1887f" strokeWidth="1.2" opacity="0.6" />
                  
                  {/* Mast */}
                  <line x1="10" y1="20" x2="10" y2="-40" stroke="#5d4037" strokeWidth="3" strokeLinecap="round" />
                  {/* Yard */}
                  <line x1="-25" y1="-32" x2="45" y2="-32" stroke="#5d4037" strokeWidth="2.2" strokeLinecap="round" />
                  {/* Sail */}
                  <path d="M -20,-32 Q 10,-28 40,-32 Q 52,-15 38,10 Q 10,14 -15,10 Q -5,-15 -20,-32 Z" fill="rgba(248, 245, 235, 0.95)" stroke="#d4c5a1" strokeWidth="1" />
                  
                  {/* Boat hull */}
                  <path d="M -60,20 Q -70,36 -50,40 L 70,40 Q 90,36 80,20 Z" fill="#8d6e63" stroke="#5d4037" strokeWidth="2" />
                  <path d="M -60,20 L 80,20" stroke="#5d4037" strokeWidth="2.5" />
                  
                  {/* Oars in water */}
                  {[0,1,2,3,4].map(i => (
                    <g key={i}>
                      <line x1={-45 + i*22} y1="32" x2={-52 + i*22} y2="55" stroke="#a1887f" strokeWidth="1.5" />
                      <ellipse cx={-53 + i*22} cy="56" rx="3.5" ry="1.5" fill="#a1887f" />
                    </g>
                  ))}

                  {/* 5 survivors as colored dots */}
                  {[-45,-25,-5,15,35].map((cx,i) => (
                    <circle key={i} cx={cx} cy="14" r="6" fill="#4CAF50" stroke="#388e3c" strokeWidth="1.5" />
                  ))}
                  {/* 6th person - sits as a head circle, becomes full body stick figure during the throw animation */}
                  <motion.g
                    animate={
                      animationState === 'running' && decision === 'yes'
                        ? { x: [0, 60, 110], y: [0, -40, 50], rotate: [0, 120, 360], opacity: [1, 1, 0] }
                        : {}
                    }
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  >
                    {animationState === 'running' && decision === 'yes' ? (
                      <StickFigure x={55} y={24} color="#2196F3" scale={0.85} bg="none" />
                    ) : (
                      <circle cx="55" cy="14" r="6" fill={animationState === 'complete' ? '#ff5252' : '#2196F3'} stroke="#1565c0" strokeWidth="1.5" />
                    )}
                  </motion.g>
                  <text x="-50" y="8" fill="#fff" fontSize="6.5" fontWeight="bold">LIFEBOAT</text>
                </motion.g>
                
                {/* Person overboard - bobs up and down in sync with the waves */}
                {animationState === 'complete' && decision === 'yes' && (
                  <motion.g
                    initial={{ opacity: 0, x: 215, y: 130 }}
                    animate={{ opacity: 1, y: [133, 139, 133] }}
                    transition={{
                      opacity: { duration: 0.5 },
                      y: { repeat: Infinity, duration: 3.2, ease: "easeInOut" }
                    }}
                  >
                    <circle cx="0" cy="0" r="6" fill="#ff5252" stroke="#b71c1c" strokeWidth="1.5" />
                    <text x="-22" y="-14" fill="#ff5252" fontSize="6.5" fontWeight="bold">OVERBOARD</text>
                  </motion.g>
                )}
              </svg>
            )}

            {currentScenario === 7 && (
              <svg viewBox="0 0 450 200" width="100%" height="100%" style={{ overflow: "hidden" }}>
                <defs>
                  <radialGradient id="moonGlow7" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#eceff1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#eceff1" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="graveSky7" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d1117" />
                    <stop offset="100%" stopColor="#1a2035" />
                  </linearGradient>
                </defs>
                {/* Dark cemetery sky */}
                <rect x="0" y="0" width="450" height="200" fill="url(#graveSky7)" />
                {/* Stars */}
                {[{x:25,y:10},{x:70,y:6},{x:130,y:15},{x:200,y:5},{x:290,y:12},{x:370,y:8},{x:430,y:18}].map((s,i) => (
                  <motion.circle key={i} cx={s.x} cy={s.y} r="1" fill="#fff" animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: i * 0.15 }} />
                ))}
                {/* Moon with glow */}
                <circle cx="400" cy="30" r="25" fill="url(#moonGlow7)" />
                <circle cx="400" cy="30" r="18" fill="#eceff1" />
                <circle cx="410" cy="26" r="14" fill="#1a2035" />
                {/* Ground */}
                <rect x="0" y="150" width="450" height="50" fill="#161b22" />
                <line x1="0" y1="150" x2="450" y2="150" stroke="#21262d" strokeWidth="2" />
                {/* Grass */}
                {Array.from({length: 30}).map((_,i) => (
                  <line key={i} x1={i*16+3} y1="150" x2={i*16+8} y2="143" stroke="#2d4a1e" strokeWidth="2" strokeLinecap="round" />
                ))}
                {/* Gravestones background */}
                {[{x:30,h:40},{x:80,h:30},{x:345,h:42},{x:410,h:28}].map((g,i) => (
                  <g key={i}>
                    <rect x={g.x} y={150-g.h} width="22" height={g.h} rx="4" fill="#21262d" stroke="#30363d" strokeWidth="1.5" />
                    <path d={`M ${g.x},${150-g.h} Q ${g.x+11},${150-g.h-12} ${g.x+22},${150-g.h}`} fill="#21262d" stroke="#30363d" strokeWidth="1.5" />
                  </g>
                ))}
                {/* Main friend's gravestone - center */}
                <rect x="180" y="90" width="40" height="60" rx="6" fill="#21262d" stroke="#30363d" strokeWidth="2" />
                <path d="M 180,100 Q 200,82 220,100" fill="#21262d" stroke="#30363d" strokeWidth="2" />
                <text x="190" y="118" fill="#90a4ae" fontSize="8" fontWeight="bold">R.I.P</text>
                <line x1="185" y1="125" x2="215" y2="125" stroke="#30363d" strokeWidth="1.5" />
                <text x="188" y="138" fill="#546e7a" fontSize="6">FRIEND</text>
                <text x="189" y="146" fill="#546e7a" fontSize="5.5">1968-2019</text>
                {/* Candle beside grave */}
                <motion.g animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <rect x="228" y="135" width="6" height="15" fill="#eceff1" rx="1" />
                  <path d="M 231,135 L 228,128 L 231,131 L 234,128 Z" fill="#ffcc44" />
                </motion.g>
                {/* Locked box = Sacred Promise */}
                <g transform="translate(250, 120)">
                  {/* Shackle drawn behind lock body */}
                  <motion.path
                    d="M -8,-12 L -8,-22 Q 0,-30 8,-22 L 8,-12"
                    fill="none" stroke="#ffd54f" strokeWidth="3.5"
                    animate={animationState === 'complete' && decision === 'yes' ? { y: -5, rotate: -30 } : { y: 0, rotate: 0 }}
                    style={{ transformOrigin: "-8px -12px" }}
                    transition={{ type: "spring", stiffness: 120, damping: 10 }}
                  />
                  <rect x="-14" y="-12" width="28" height="22" rx="3" fill="#ffd54f" stroke="#ffb300" strokeWidth="2" />
                  <circle cx="0" cy="5" r="4" fill="#3e2723" />
                  <text x="0" y="19" textAnchor="middle" fill="#ffd54f" fontSize="7" fontWeight="bold">PROMISE</text>
                </g>
                {/* Crowd of people in danger */}
                <g transform="translate(360, 140)">
                  {[{x:0,y:0},{x:16,y:10},{x:16,y:-10},{x:30,y:4}].map((pos,i) => (
                    <StickFigure key={i} x={pos.x} y={pos.y}
                      color={animationState === 'complete' && decision === 'no' ? '#ff5252' : '#81c784'}
                      isDead={animationState === 'complete' && decision === 'no'} scale={0.65} bg="#161b22" />
                  ))}
                  <text x="-12" y="-28" fill="var(--text-secondary)" fontSize="6.5" fontWeight="bold">THE PUBLIC</text>
                </g>
                {/* YOU figure */}
                <StickFigure x={130} y={150} color="#4CAF50" bg="#161b22" scale={0.9} />
                <text x="122" y="116" fill="#4CAF50" fontSize="7" fontWeight="800">YOU</text>
                {/* Information beam when revealing */}
                {animationState === 'complete' && decision === 'yes' && (
                  <motion.g>
                    <motion.line
                      x1="250" y1="115" x2="345" y2="130"
                      stroke="#ffeb3b" strokeWidth="2.5" strokeDasharray="6,4"
                      animate={{ strokeDashoffset: [30, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    />
                    <circle cx="345" cy="130" r="6" fill="#ffeb3b" opacity="0.5" />
                    <text x="280" y="125" fill="#ffeb3b" fontSize="6" fontWeight="bold">SECRET REVEALED</text>
                  </motion.g>
                )}
              </svg>
            )}

            {currentScenario === 8 && (
              <svg viewBox="0 0 450 200" width="100%" height="100%" style={{ overflow: "hidden" }}>
                <defs>
                  <linearGradient id="techBg8" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#050d1a" />
                    <stop offset="100%" stopColor="#0f1f35" />
                  </linearGradient>
                  <radialGradient id="coreGlow8" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect x="0" y="0" width="450" height="200" fill="url(#techBg8)" />
                {/* Grid background */}
                {Array.from({length: 9}).map((_,i) => (
                  <line key={`h${i}`} x1="0" y1={i*25} x2="450" y2={i*25} stroke="rgba(79,70,229,0.06)" strokeWidth="1" />
                ))}
                {Array.from({length: 19}).map((_,i) => (
                  <line key={`v${i}`} x1={i*25} y1="0" x2={i*25} y2="200" stroke="rgba(79,70,229,0.06)" strokeWidth="1" />
                ))}
                {/* Candidate database - left panel */}
                <rect x="10" y="20" width="95" height="160" fill="#0f1f35" rx="4" stroke="#1e3a5f" strokeWidth="1.5" />
                <text x="18" y="35" fill="#94a3b8" fontSize="7" fontWeight="bold">CANDIDATES</text>
                <line x1="10" y1="40" x2="105" y2="40" stroke="#1e3a5f" strokeWidth="1" />
                {/* Candidate rows */}
                {[
                  {y:50, grp:'A', score:92, col:'#10b981'},
                  {y:65, grp:'A', score:88, col:'#10b981'},
                  {y:80, grp:'A', score:95, col:'#10b981'},
                  {y:95, grp:'B', score:90, col:'#ef4444'},
                  {y:110, grp:'B', score:87, col:'#ef4444'},
                  {y:125, grp:'B', score:93, col:'#ef4444'},
                ].map((r,i) => (
                  <g key={i}>
                    <circle cx="24" cy={r.y+5} r="5" fill={r.col} opacity="0.8" />
                    <text x="34" y={r.y+9} fill="#e2e8f0" fontSize="6.5" fontWeight="bold">Group {r.grp}</text>
                    <text x="75" y={r.y+9} fill={r.col} fontSize="6.5" fontWeight="800">{r.score}%</text>
                  </g>
                ))}
                {/* AI Brain/Core - center */}
                <g transform="translate(210, 100)">
                  <circle r="38" fill="url(#coreGlow8)" />
                  <circle r="28" fill="#1e1b4b" stroke="#4f46e5" strokeWidth="2" />
                  {/* Neural network lines */}
                  {[{x1:-18,y1:-12,x2:12,y2:-8},{x1:-20,y1:0,x2:14,y2:2},{x1:-18,y1:12,x2:12,y2:8}].map((l,i) => (
                    <motion.line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                      stroke="#818cf8" strokeWidth="1.5"
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
                    />
                  ))}
                  {[-12,0,12].map((y,i) => (
                    <motion.circle key={i} cx="0" cy={y} r="3.5" fill="#6366f1"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.35 }}
                    />
                  ))}
                  <text x="-22" y="-38" fill="#e2e8f0" fontSize="7" fontWeight="bold">AI SCREENER</text>
                  {/* Rotating orbit ring */}
                  <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}>
                    <circle r="36" fill="none" stroke="#4f46e5" strokeWidth="1" strokeDasharray="4,6" />
                  </motion.g>
                </g>
                {/* Results panel - right */}
                <rect x="300" y="20" width="140" height="160" fill="#0f1f35" rx="4" stroke="#1e3a5f" strokeWidth="1.5" />
                <text x="314" y="35" fill="#94a3b8" fontSize="7" fontWeight="bold">AI DECISION</text>
                <line x1="300" y1="40" x2="440" y2="40" stroke="#1e3a5f" strokeWidth="1" />
                <text x="314" y="55" fill="#94a3b8" fontSize="6.5">EFFICIENCY:</text>
                <text x="375" y="55" fill="#10b981" fontSize="8" fontWeight="900">
                  {animationState === 'complete' && decision === 'yes' ? "98%" : "85%"}
                </text>
                {/* Bias bar chart */}
                <text x="314" y="75" fill="#94a3b8" fontSize="6.5">BIAS LEVELS</text>
                <text x="314" y="92" fill="#e2e8f0" fontSize="6">Group A:</text>
                <rect x="355" y="84" width="70" height="8" rx="2" fill="#10b981" />
                <text x="314" y="112" fill="#e2e8f0" fontSize="6">Group B:</text>
                <motion.rect
                  x="355" y="104" height="8" fill="#ef4444" rx="2"
                  animate={{ width: animationState === 'complete' && decision === 'yes' ? 20 : 55 }}
                  transition={{ duration: 1 }}
                  initial={{ width: 55 }}
                />
                <text x="314" y="132" fill="#94a3b8" fontSize="6.5">APPROVED RATE:</text>
                <text x="314" y="148" fill="#10b981" fontSize="7" fontWeight="900">Group A: 71%</text>
                <motion.text x="314" y="163" fill="#ef4444" fontSize="7" fontWeight="900"
                  animate={{ opacity: animationState === 'complete' && decision === 'yes' ? 0.4 : 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Group B: {animationState === 'complete' && decision === 'yes' ? "52%" : "42%"}
                </motion.text>
                {/* Connection lines from DB to AI */}
                {[50,80,110].map((y,i) => (
                  <motion.line key={i} x1="105" y1={y} x2="172" y2="100"
                    stroke="#6366f1" strokeWidth="1" strokeDasharray="4,4"
                    animate={{ strokeDashoffset: [16, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear", delay: i * 0.25 }}
                  />
                ))}
                {/* Connection lines from AI to results */}
                {[60,90,120].map((y,i) => (
                  <motion.line key={i} x1="248" y1="100" x2="300" y2={y}
                    stroke={decision === 'yes' ? "#10b981" : "#6366f1"} strokeWidth="1" strokeDasharray="4,4"
                    animate={{ strokeDashoffset: [16, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear", delay: i * 0.25 + 0.4 }}
                  />
                ))}
              </svg>
            )}

            {currentScenario === 9 && (
              <svg viewBox="0 0 450 200" width="100%" height="100%" style={{ overflow: "hidden" }}>
                <defs>
                  <linearGradient id="streetSky9" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d1117" />
                    <stop offset="70%" stopColor="#161b22" />
                    <stop offset="100%" stopColor="#1c2128" />
                  </linearGradient>
                  <radialGradient id="lampGlow9" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffeb3b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ffeb3b" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* Night street */}
                <rect x="0" y="0" width="450" height="200" fill="url(#streetSky9)" />
                {/* Stars */}
                {[{x:35,y:12},{x:85,y:7},{x:155,y:18},{x:230,y:5},{x:320,y:14},{x:395,y:8}].map((s,i) => (
                  <motion.circle key={i} cx={s.x} cy={s.y} r="1" fill="#fff" animate={{ opacity: [0.3, 0.9, 0.3] }} transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.2 }} />
                ))}
                {/* Sidewalk */}
                <rect x="0" y="145" width="450" height="55" fill="#1c2128" />
                <line x1="0" y1="145" x2="450" y2="145" stroke="#30363d" strokeWidth="3" />
                {/* Pavement cracks / tiles */}
                {[80,160,240,320,400].map((x,i) => (
                  <line key={i} x1={x} y1="145" x2={x} y2="200" stroke="#21262d" strokeWidth="1.5" />
                ))}
                {/* Street lamp - left */}
                <line x1="40" y1="145" x2="40" y2="50" stroke="#484f58" strokeWidth="4" />
                <path d="M 40,50 Q 40,38 62,38" fill="none" stroke="#484f58" strokeWidth="4" />
                <ellipse cx="62" cy="38" rx="12" ry="6" fill="#ffeb3b" />
                <ellipse cx="62" cy="38" rx="30" ry="25" fill="url(#lampGlow9)" />
                {/* Street lamp - right */}
                <line x1="415" y1="145" x2="415" y2="50" stroke="#484f58" strokeWidth="4" />
                <path d="M 415,50 Q 415,38 393,38" fill="none" stroke="#484f58" strokeWidth="4" />
                <ellipse cx="393" cy="38" rx="12" ry="6" fill="#ffeb3b" />
                <ellipse cx="393" cy="38" rx="30" ry="25" fill="url(#lampGlow9)" />
                {/* Wallet on the ground - highlighted in spotlight, remains visible from start and fades out when picked up */}
                <g transform="translate(218, 145)">
                  <motion.g
                    initial={{ opacity: 1 }}
                    animate={
                      animationState === 'running'
                        ? { opacity: [1, 1, 0, 0], scale: [1, 1.04, 1, 1] }
                        : animationState === 'complete'
                        ? { opacity: 0 }
                        : { opacity: 1, scale: [1, 1.04, 1] }
                    }
                    transition={
                      animationState === 'running'
                        ? { duration: 2.2, times: [0, 0.25, 0.3, 1.0], ease: "linear" }
                        : { repeat: Infinity, duration: 1.8 }
                    }
                  >
                    <rect x="-12" y="-7" width="24" height="14" rx="3" fill="#5d4037" stroke="#3e2723" strokeWidth="1.5" />
                    <line x1="-12" y1="1" x2="12" y2="1" stroke="#3e2723" strokeWidth="2" />
                    <rect x="3" y="-10" width="8" height="7" rx="1" fill="#4CAF50" />
                    <text x="-18" y="-14" fill="#ffcc44" fontSize="6.5" fontWeight="bold">$2,000 WALLET</text>
                  </motion.g>
                </g>
                

                {/* Owner silhouette far right (the person who lost it) */}
                <StickFigure x={340} y={145} color="var(--text-secondary)" bg="#1c2128" scale={0.7} />
                <text x="340" y="115" textAnchor="middle" fill="var(--text-secondary)" fontSize="7.5" fontWeight="bold">OWNER</text>
                
                {/* Wallet in owner's hand - appears when YOU hands it over, and stays there */}
                {(animationState === 'complete' || animationState === 'running') && decision === 'yes' && (
                  <motion.g
                    transform="translate(340, 145) scale(0.7)"
                    initial={{ opacity: 0 }}
                    animate={
                      animationState === 'running'
                        ? { opacity: [0, 0, 0, 1, 1] }
                        : { opacity: 1 }
                    }
                    transition={
                      animationState === 'running'
                        ? { duration: 2.2, times: [0, 0.65, 0.7, 0.75, 1.0] }
                        : {}
                    }
                  >
                    <rect x="-14" y="-16" width="10" height="6" rx="1.5" fill="#5d4037" />
                    <rect x="-11" y="-18" width="3" height="2" rx="0.8" fill="#4CAF50" />
                  </motion.g>
                )}
                
                {/* YOU figure */}
                <motion.g
                  initial={{ x: 70, y: 145 }}
                  animate={
                    animationState === 'running' && decision === 'yes'
                      ? { x: [70, 218, 320, 260] }
                      : animationState === 'complete' && decision === 'yes'
                      ? { x: 260 }
                      : animationState === 'running' && decision === 'no'
                      ? { x: [70, 218, 120] }
                      : animationState === 'complete' && decision === 'no'
                      ? { x: 120 }
                      : { x: 70 }
                  }
                  transition={{ duration: 2.2 }}
                >
                  <StickFigure x={0} y={0} color="#4CAF50" bg="#1c2128" scale={0.9} />
                  <text x="-10" y="-36" fill="#4CAF50" fontSize="7" fontWeight="800">YOU</text>
                  {/* Wallet in hand when picked up */}
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={
                      animationState === 'running' && decision === 'yes'
                        ? { opacity: [0, 0, 1, 1, 0] }
                        : animationState === 'running' && decision === 'no'
                        ? { opacity: [0, 0, 1, 0] }
                        : { opacity: 0 }
                    }
                    transition={{ duration: 2.2, times: decision === 'yes' ? [0, 0.25, 0.3, 0.7, 0.75] : [0, 0.45, 0.5, 0.55] }}
                  >
                    <rect x="10" y="-12" width="12" height="7" rx="2" fill="#5d4037" />
                    <rect x="14" y="-14" width="4" height="3" rx="1" fill="#4CAF50" />
                  </motion.g>
                </motion.g>
                {/* Money particles when keeping */}
                {animationState === 'complete' && decision === 'no' && (
                  <g transform="translate(130, 100)">
                    {[0,1,2,3].map(i => (
                      <motion.text key={i} x={i * 14} y="0" fill="#4CAF50" fontSize="12" fontWeight="bold"
                        animate={{ y: [-10, -45], opacity: [1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                      >
                        $
                      </motion.text>
                    ))}
                  </g>
                )}
              </svg>
            )}

            {currentScenario === 10 && (
              <svg viewBox="0 0 450 200" width="100%" height="100%" style={{ overflow: "hidden" }}>
                <defs>
                  <radialGradient id="fireGlow10" cx="50%" cy="100%" r="80%">
                    <stop offset="0%" stopColor="#ff6d00" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#ff6d00" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="museBg10" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a0a00" />
                    <stop offset="100%" stopColor="#2d1400" />
                  </linearGradient>
                </defs>
                {/* Museum interior background */}
                <rect x="0" y="0" width="450" height="200" fill="url(#museBg10)" />
                {/* Floor */}
                <rect x="0" y="160" width="450" height="40" fill="#1c0a00" />
                <line x1="0" y1="160" x2="450" y2="160" stroke="#3e1a00" strokeWidth="2" />
                {/* Floor tiles */}
                {[0,1,2,3,4,5].map(i => (
                  <g key={i}>
                    <line x1={i*75} y1="160" x2={i*75} y2="200" stroke="#2d1400" strokeWidth="1.5" />
                  </g>
                ))}
                {/* Ceiling */}
                <rect x="0" y="0" width="450" height="18" fill="#2d1400" />
                {/* Columns */}
                {[60,180,270,390].map((x,i) => (
                  <g key={i}>
                    <rect x={x} y="18" width="14" height="142" fill="#3e2000" stroke="#5d2e00" strokeWidth="1" />
                    <rect x={x-4} y="14" width="22" height="8" fill="#5d2e00" />
                    <rect x={x-4} y="155" width="22" height="8" fill="#5d2e00" />
                  </g>
                ))}
                {/* Museum artworks on walls */}
                {/* Left wall artworks */}
                <rect x="80" y="40" width="45" height="60" rx="2" fill="#1a0d00" stroke="#7c3a00" strokeWidth="2" />
                <rect x="84" y="44" width="37" height="52" rx="1" fill="#2d1800" />
                <path d="M 84,80 Q 102,55 121,70 Q 115,90 84,96 Z" fill="#8d5524" opacity="0.7" />
                <path d="M 90,52 Q 105,48 115,58" fill="none" stroke="#ffd54f" strokeWidth="1.5" opacity="0.5" />
                <rect x="86" y="40" width="41" height="4" fill="#7c3a00" />
                <text x="82" y="38" fill="#ffd54f" fontSize="6" fontWeight="bold">PORTRAIT</text>
                {/* Center/Right artworks */}
                <rect x="200" y="35" width="55" height="70" rx="2" fill="#1a0d00" stroke="#7c3a00" strokeWidth="2" />
                {/* Landscape painting */}
                <rect x="204" y="39" width="47" height="62" rx="1" fill="#ffa726" />
                <circle cx="228" cy="55" r="8" fill="#ffeb3b" />
                <polygon points="204,101 222,75 235,90 242,80 251,101" fill="#5d4037" />
                <text x="200" y="33" fill="#ffd54f" fontSize="6" fontWeight="bold">MASTERPIECE</text>
                {/* Sculpture pedestal */}
                <rect x="295" y="100" width="30" height="60" fill="#3e2000" stroke="#5d2e00" strokeWidth="1.5" />
                <rect x="290" y="95" width="40" height="8" rx="2" fill="#5d2e00" />
                {/* Sculpture */}
                <circle cx="310" cy="80" r="8" fill="#b0bec5" stroke="#90a4ae" strokeWidth="1.5" />
                <line x1="310" y1="88" x2="310" y2="95" stroke="#b0bec5" strokeWidth="3" />
                <text x="295" y="75" fill="#ffd54f" fontSize="5.5" fontWeight="bold">SCULPTURE</text>
                {/* TRAPPED STRANGER - left in flames */}
                <g transform="translate(65, 150)">
                  {!(animationState === 'complete' && decision === 'no') && (
                    <StickFigure x={0} y={0} color="#ff8a65" bg="#2d1400" isDead={animationState === 'complete' && decision === 'yes' === false} scale={0.85} />
                  )}
                  {animationState === 'complete' && decision === 'no' && (
                    <StickFigure x={0} y={0} color="#ff5252" bg="#2d1400" isDead={true} scale={0.85} />
                  )}
                  <text x="-24" y="-22" fill="#ff8a65" fontSize="6.5" fontWeight="bold">STRANGER</text>
                </g>

                {/* Incipient starting fires - visible only while deciding or running */}
                {animationState !== 'complete' && (
                  <>
                    {/* Fire under stranger (bottom at floor) */}
                    <motion.g transform="translate(65, 160)" animate={{ scaleY: [1, 1.2, 0.9, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                      <path d="M -10,0 L -4,-18 L 2,-8 L 8,-22 L 14,0 Z" fill="#ff3d00" />
                      <path d="M -6,0 L -2,-12 L 2,-5 L 6,-15 L 9,0 Z" fill="#ffb300" />
                    </motion.g>
                    {/* Fire under masterpiece painting (bottom of frame on the wall) */}
                    <motion.g transform="translate(227, 101)" animate={{ scaleY: [1, 1.15, 0.95, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.0 }}>
                      <path d="M -8,0 L -3,-15 L 2,-6 L 7,-18 L 12,0 Z" fill="#ff3d00" />
                      <path d="M -5,0 L -1,-10 L 2,-4 L 5,-12 L 8,0 Z" fill="#ffb300" />
                    </motion.g>
                    {/* Fire under sculpture (bottom of sculpture itself on top of the cap) */}
                    <motion.g transform="translate(310, 95)" animate={{ scaleY: [1, 1.25, 0.9, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}>
                      <path d="M -8,0 L -3,-16 L 2,-7 L 7,-20 L 12,0 Z" fill="#ff3d00" />
                      <path d="M -5,0 L -1,-11 L 2,-5 L 5,-13 L 8,0 Z" fill="#ffb300" />
                    </motion.g>
                  </>
                )}

                {/* Massive fires at the end state */}
                {animationState === 'complete' && decision === 'yes' && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.9 }}>
                    {/* Original massive right fire centered on sculpture */}
                    <path d="M 270,160 L 290,50 L 310,100 L 330,20 L 350,110 L 360,40 L 375,160 Z" fill="#ff3d00" />
                    <path d="M 285,160 L 300,80 L 315,110 L 330,60 L 350,160 Z" fill="#ffb300" />
                    {/* Massive fire engulfing the masterpiece painting on the right wall */}
                    <path d="M 200,105 L 220,50 L 235,80 L 245,45 L 260,105 Z" fill="#ff3d00" />
                    <path d="M 210,105 L 225,65 L 235,90 L 245,60 L 250,105 Z" fill="#ffb300" />
                  </motion.g>
                )}
                {animationState === 'complete' && decision === 'no' && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.9 }}>
                    {/* Original massive left fire completely engulfing the stranger */}
                    <path d="M 20,160 L 35,40 L 55,100 L 75,20 L 95,110 L 105,40 L 120,160 Z" fill="#ff3d00" />
                    <path d="M 35,160 L 50,80 L 65,110 L 80,60 L 105,160 Z" fill="#ffb300" />
                  </motion.g>
                )}

                {/* YOU (rescuer) figure holding a fire extinguisher */}
                <motion.g
                  initial={{ x: 200, y: 150 }}
                  animate={
                    animationState === 'running' && decision === 'yes'
                      ? { x: [200, 70, 135] }
                      : animationState === 'complete' && decision === 'yes'
                      ? { x: 135 }
                      : animationState === 'running' && decision === 'no'
                      ? { x: [200, 270, 170] }
                      : animationState === 'complete' && decision === 'no'
                      ? { x: 170 }
                      : { x: 200 }
                  }
                  transition={{ duration: 2.0 }}
                >
                  <StickFigure x={0} y={0} color="#4CAF50" bg="#2d1400" scale={0.9} />
                  <text x="-10" y="-36" fill="#4CAF50" fontSize="7" fontWeight="800">YOU</text>
                  
                  {/* Fire Extinguisher - dynamically faces the target (LEFT for stranger/yes, RIGHT for artworks/no/idle) */}
                  {decision === 'yes' ? (
                    <g transform="translate(-9, -13)">
                      <rect x="-2" y="-1" width="4" height="10" rx="1" fill="#d32f2f" stroke="#b71c1c" strokeWidth="0.5" />
                      <rect x="-1" y="-3" width="2" height="2" fill="#37474f" />
                      <line x1="0" y1="-2" x2="-4" y2="-4" stroke="#37474f" strokeWidth="0.8" />
                      {/* White smoke spray out (extinguishing the fire/securing the stranger) */}
                      {smokeActive && (
                        <g>
                          {/* Expanding base cloud volume */}
                          <motion.path
                            d="M -6,-5 L -20,-15 C -35,-8 -35,5 -20,2 Z"
                            fill="#ffffff"
                            initial={{ opacity: 0 }}
                            animate={{ scaleX: [1, 2.5], scaleY: [1, 2.8], opacity: [0.45, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, ease: "easeOut" }}
                            style={{ transformOrigin: "-6px -5px" }}
                          />
                          {/* Particle 1 */}
                          <motion.circle cx="-6" cy="-5" r="2" fill="#ffffff" opacity="0.95"
                            animate={{ cx: [-6, -55], cy: [-5, -28], r: [2, 32], opacity: [0.95, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, ease: "easeOut" }}
                          />
                          {/* Particle 2 */}
                          <motion.circle cx="-6" cy="-5" r="2" fill="#ffffff" opacity="0.95"
                            animate={{ cx: [-6, -45], cy: [-5, -6], r: [2, 25], opacity: [0.95, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.08, ease: "easeOut" }}
                          />
                          {/* Particle 3 */}
                          <motion.circle cx="-6" cy="-5" r="2" fill="#ffffff" opacity="0.95"
                            animate={{ cx: [-6, -72], cy: [-5, -18], r: [2, 45], opacity: [0.95, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.16, ease: "easeOut" }}
                          />
                          {/* Particle 4 */}
                          <motion.circle cx="-6" cy="-5" r="2" fill="#ffffff" opacity="0.95"
                            animate={{ cx: [-6, -52], cy: [-5, 12], r: [2, 35], opacity: [0.95, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.24, ease: "easeOut" }}
                          />
                          {/* Particle 5 */}
                          <motion.circle cx="-6" cy="-5" r="2" fill="#ffffff" opacity="0.95"
                            animate={{ cx: [-6, -66], cy: [-5, -24], r: [2, 40], opacity: [0.95, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.32, ease: "easeOut" }}
                          />
                          {/* Particle 6 */}
                          <motion.circle cx="-6" cy="-5" r="2" fill="#ffffff" opacity="0.95"
                            animate={{ cx: [-6, -36], cy: [-5, -2], r: [2, 23], opacity: [0.95, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.40, ease: "easeOut" }}
                          />
                          {/* Particle 7 */}
                          <motion.circle cx="-6" cy="-5" r="2" fill="#ffffff" opacity="0.95"
                            animate={{ cx: [-6, -76], cy: [-5, -8], r: [2, 48], opacity: [0.95, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.48, ease: "easeOut" }}
                          />
                          {/* Particle 8 */}
                          <motion.circle cx="-6" cy="-5" r="2" fill="#ffffff" opacity="0.95"
                            animate={{ cx: [-6, -60], cy: [-5, -20], r: [2, 38], opacity: [0.95, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.56, ease: "easeOut" }}
                          />
                        </g>
                      )}
                    </g>
                  ) : (
                    <g transform="translate(9, -13)">
                      <rect x="-2" y="-1" width="4" height="10" rx="1" fill="#d32f2f" stroke="#b71c1c" strokeWidth="0.5" />
                      <rect x="-1" y="-3" width="2" height="2" fill="#37474f" />
                      <line x1="0" y1="-2" x2="4" y2="-4" stroke="#37474f" strokeWidth="0.8" />
                      {/* White smoke spray out (extinguishing the fire/securing the artworks) */}
                      {smokeActive && (
                        <g>
                          {/* Expanding base cloud volume */}
                          <motion.path
                            d="M 6,-5 L 20,-15 C 35,-8 35,5 20,2 Z"
                            fill="#ffffff"
                            initial={{ opacity: 0 }}
                            animate={{ scaleX: [1, 2.5], scaleY: [1, 2.8], opacity: [0.45, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, ease: "easeOut" }}
                            style={{ transformOrigin: "6px -5px" }}
                          />
                          {/* Particle 1 */}
                          <motion.circle cx="6" cy="-5" r="2" fill="#ffffff" opacity="0.95"
                            animate={{ cx: [6, 55], cy: [-5, -28], r: [2, 32], opacity: [0.95, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, ease: "easeOut" }}
                          />
                          {/* Particle 2 */}
                          <motion.circle cx="6" cy="-5" r="2" fill="#ffffff" opacity="0.95"
                            animate={{ cx: [6, 45], cy: [-5, -6], r: [2, 25], opacity: [0.95, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.08, ease: "easeOut" }}
                          />
                          {/* Particle 3 */}
                          <motion.circle cx="6" cy="-5" r="2" fill="#ffffff" opacity="0.95"
                            animate={{ cx: [6, 72], cy: [-5, -18], r: [2, 45], opacity: [0.95, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.16, ease: "easeOut" }}
                          />
                          {/* Particle 4 */}
                          <motion.circle cx="6" cy="-5" r="2" fill="#ffffff" opacity="0.95"
                            animate={{ cx: [6, 52], cy: [-5, 12], r: [2, 35], opacity: [0.95, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.24, ease: "easeOut" }}
                          />
                          {/* Particle 5 */}
                          <motion.circle cx="6" cy="-5" r="2" fill="#ffffff" opacity="0.95"
                            animate={{ cx: [6, 66], cy: [-5, -24], r: [2, 40], opacity: [0.95, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.32, ease: "easeOut" }}
                          />
                          {/* Particle 6 */}
                          <motion.circle cx="6" cy="-5" r="2" fill="#ffffff" opacity="0.95"
                            animate={{ cx: [6, 36], cy: [-5, -2], r: [2, 23], opacity: [0.95, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.40, ease: "easeOut" }}
                          />
                          {/* Particle 7 */}
                          <motion.circle cx="6" cy="-5" r="2" fill="#ffffff" opacity="0.95"
                            animate={{ cx: [6, 76], cy: [-5, -8], r: [2, 48], opacity: [0.95, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.48, ease: "easeOut" }}
                          />
                          {/* Particle 8 */}
                          <motion.circle cx="6" cy="-5" r="2" fill="#ffffff" opacity="0.95"
                            animate={{ cx: [6, 60], cy: [-5, -20], r: [2, 38], opacity: [0.95, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.56, ease: "easeOut" }}
                          />
                        </g>
                      )}
                    </g>
                  )}
                  
                  {animationState === 'complete' && decision === 'yes' && (
                    <circle cx="8" cy="-6" r="5" fill="#ff8a65" />
                  )}
                </motion.g>
              </svg>
            )}
          </Box>

          <Box style={{ display: 'flex', gap: '14px' }}>
            <Button
              variant="contained"
              disabled={animationState === 'running' || animationState === 'complete'}
              onClick={() => handleChoice('yes')}
              style={{
                flex: 1,
                background: 'var(--hero-gradient)',
                color: '#fff',
                fontWeight: 800,
                borderRadius: '10px',
                textTransform: 'none',
                padding: '12px'
              }}
            >
              {scenarios[currentScenario - 1].yesLabel}
            </Button>
            <Button
              variant="contained"
              disabled={animationState === 'running' || animationState === 'complete'}
              onClick={() => handleChoice('no')}
              style={{
                flex: 1,
                background: 'var(--hero-gradient)',
                color: '#fff',
                fontWeight: 800,
                borderRadius: '10px',
                textTransform: 'none',
                padding: '12px'
              }}
            >
              {scenarios[currentScenario - 1].noLabel}
            </Button>
          </Box>

          {animationState === 'complete' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '16px', textAlign: 'center' }}>
              <Typography variant="body2" style={{ color: 'var(--primary-main)', fontWeight: 800, marginBottom: '10px' }}>
                Consequence Animated. Ready to proceed.
              </Typography>
              <Button
                variant="contained"
                onClick={handleNext}
                style={{
                  background: 'rgba(128,128,128,0.08)',
                  color: 'var(--text-primary)',
                  fontWeight: 800,
                  borderRadius: '8px',
                  textTransform: 'none'
                }}
              >
                {currentScenario < 10 ? "Continue to Next Scenario" : "Show Ethical Profile"}
              </Button>
            </motion.div>
          )}
        </Box>
      ) : (
        <Box>
          <Typography variant="subtitle1" style={{ fontWeight: 800, color: '#4CAF50', textAlign: 'center', marginBottom: '18px' }}>
            ✓ Ethical Profiling Complete!
          </Typography>

          <Grid container spacing={2} style={{ marginBottom: '24px' }}>
            <Grid item xs={6}>
              <Box style={{ padding: '16px', background: 'rgba(28, 176, 246, 0.08)', borderRadius: '12px', border: '1px solid rgba(28,176,246,0.2)', textAlign: 'center' }}>
                <Typography variant="caption" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: 800 }}>Utilitarian Index</Typography>
                <Typography variant="h4" style={{ fontWeight: 900, color: 'var(--primary-main)' }}>
                  {calculateProfile().utilitarianPct}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box style={{ padding: '16px', background: 'rgba(255, 82, 82, 0.08)', borderRadius: '12px', border: '1px solid rgba(255,82,82,0.2)', textAlign: 'center' }}>
                <Typography variant="caption" style={{ display: 'block', color: 'var(--text-secondary)', fontWeight: 800 }}>Deontology Index</Typography>
                <Typography variant="h4" style={{ fontWeight: 900, color: '#FF5252' }}>
                  {calculateProfile().deontologyPct}%
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', fontFamily: '"Outfit", sans-serif' }}>
            Scenario Choices Breakdown
          </Typography>
          <Grid container spacing={2} style={{ marginBottom: '24px' }}>
            {scenarios.map((scen) => {
              const answer = answers[scen.id];
              const isYes = answer === 'yes';
              let choiceText = isYes ? scen.yesLabel : scen.noLabel;
              
              let implication = '';
              if (scen.id === 1) {
                implication = isYes 
                  ? "Utilitarian. Maximizes survivors (5 saved vs 1 lost) through indirect intervention."
                  : "Deontological. Refused to actively pull a lever to cause a person's death.";
              } else if (scen.id === 2) {
                implication = isYes
                  ? "Extreme Consequentialist. Willing to use direct physical force on a bystander to save 5."
                  : "Deontological. Refused to violate bodily rights and push a person to their death.";
              } else if (scen.id === 3) {
                implication = isYes
                  ? "Welfare Maximizer. Lied to protect an friend's life from an active threat."
                  : "Absolute Kantian. Honored truth-telling rule regardless of mortal consequences.";
              } else if (scen.id === 4) {
                implication = isYes
                  ? "Modern Consequentialist. Programmed machine to swerve and sacrifice 1 passenger to save 5 pedestrians."
                  : "Deontological Passenger Priority. Refused to actively override protection of the car's occupant.";
              } else if (scen.id === 5) {
                implication = isYes
                  ? "Need-based Consequentialist. Valued child's survival above legal property rights."
                  : "Rule Follower. Refused to engage in illegal theft, respecting property codes.";
              } else if (scen.id === 6) {
                implication = isYes
                  ? "Survival Pragmatist. Actively sacrificed one to prevent all passengers from drowning."
                  : "Deontological Passive Observer. Refused active killing, letting natural forces decide.";
              } else if (scen.id === 7) {
                implication = isYes
                  ? "Outcome-based Ethics. Broke promise to deceased person to prevent active harm to others."
                  : "Duty / Fidelity Absolute. Upheld a sacred promise at the expense of public welfare.";
              } else if (scen.id === 8) {
                implication = isYes
                  ? "Productivity Utilitarian. Deployed biased AI to maximize overall workforce efficiency."
                  : "Equity Absolute. Prioritized demographic fairness and non-discrimination over efficiency.";
              } else if (scen.id === 9) {
                implication = isYes
                  ? "Altruistic Trust. Returned the wallet to preserve community trust and owner welfare."
                  : "Egoistic Consequentialist. Kept the cash for direct personal utility, discounting owner's loss.";
              } else if (scen.id === 10) {
                implication = isYes
                  ? "Individual Duty of Care. Saved the immediate life of a single stranger in danger."
                  : "Long-term Utilitarian. Saved a priceless collection to enrich the welfare of millions over generations.";
              }

              return (
                <Grid item xs={12} sm={6} md={4} key={scen.id}>
                  <Box style={{
                    padding: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <Box>
                      <Typography variant="caption" style={{ fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                        Scenario {scen.id}
                      </Typography>
                      <Typography variant="body2" style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', fontSize: '0.85rem' }}>
                        {scen.title.split(': ')[1]}
                      </Typography>
                      <Typography variant="caption" style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        background: isYes ? 'rgba(76, 175, 80, 0.12)' : 'rgba(255, 82, 82, 0.12)',
                        color: isYes ? '#4CAF50' : '#FF5252',
                        marginBottom: '10px',
                        fontSize: '0.72rem'
                      }}>
                        {choiceText}
                      </Typography>
                    </Box>
                    <Typography variant="body2" style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', fontStyle: 'italic', lineHeight: 1.35 }}>
                      {implication}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          <Box style={{ padding: '18px', background: 'rgba(128,128,128,0.02)', border: '1px dashed rgba(128,128,128,0.25)', borderRadius: '12px', marginBottom: '20px' }}>
            <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', marginBottom: '8px' }}>
              Your Moral Profile: {calculateProfile().profileTitle}
            </Typography>
            <Typography variant="body2" style={{ color: 'var(--text-primary)', lineHeight: 1.5, fontSize: '0.82rem' }}>
              {calculateProfile().profileDesc}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={handleReset}
            style={{
              borderColor: 'rgba(128,128,128,0.25)',
              color: 'var(--text-primary)',
              fontWeight: 800,
              borderRadius: '10px',
              textTransform: 'none'
            }}
          >
            Retake Profiler
          </Button>
        </Box>
      )}
    </Paper>
  );
};

// 6. Plato's Cave Widget (Interactive Allegory of the Cave)
export const PlatosCaveWidget = () => {
  const [stage, setStage] = useState(0);
  const [userChoice, setUserChoice] = useState(null);

  const stages = [
    {
      title: "Stage 1: The Shadows (Sensory Perception)",
      description: "You are chained facing a blank cave wall. Behind you, a fire burns. Puppeteers carry figures of trees and animals along a raised wall, casting shadows. To you, these shadows are the absolute, sole reality.",
      insight: "Represents Eikasia (Imagination/Illusion). Here, we mistake sensory appearances and opinions for ultimate truth.",
      travelerX: 85,
      travelerY: 185,
      facing: 'left',
      chains: true
    },
    {
      title: "Stage 2: The Fire (Common Belief)",
      description: "Your chains are broken. You turn around and see the fire and the wooden puppets. The bright firelight hurts your eyes, and you realize the shadows were merely projections of these objects.",
      insight: "Represents Pistis (Belief/Conviction). You recognize physical objects as more real than shadows, but you are still inside the cave of sensory inputs.",
      travelerX: 160,
      travelerY: 185,
      facing: 'right',
      chains: false
    },
    {
      title: "Stage 3: The Ascent (Mathematical Reason)",
      description: "You are dragged out of the cave up a steep, rugged, and dark slope. The journey is painful. As you reach the exit, the brilliant sunlight is blinding, preventing you from looking at things directly.",
      insight: "Represents Dianoia (Thought/Reason). The transition from physical beliefs to abstract intellectual truth, requiring active effort.",
      travelerX: 340,
      travelerY: 145,
      facing: 'right',
      chains: false
    },
    {
      title: "Stage 4: The Sun (Understanding / The Good)",
      description: "Your eyes adjust. You see actual trees, rivers, and stars in their true form, rather than wooden puppets. Finally, you look at the Sun itself, realizing it is the source of all light, warmth, and existence.",
      insight: "Represents Noesis (Direct Intellect/Understanding). You contemplate the eternal Forms, culminating in the Form of the Good (represented by the Sun).",
      travelerX: 470,
      travelerY: 85,
      facing: 'right',
      chains: false
    }
  ];

  const currentStage = stages[stage];

  const handleNext = () => {
    if (stage < 3) {
      setStage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (stage > 0) {
      setStage(prev => prev - 1);
      setUserChoice(null);
    }
  };

  return (
    <Paper className="glass-panel" style={{ padding: '24px', margin: '20px 0', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Epistemology & Metaphysics: Plato's Cave Allegory
      </Typography>

      <Typography variant="body2" style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.4 }}>
        Plato's Allegory of the Cave describes the journey of the soul from the depths of sensory illusion to the height of intellectual truth and the Form of the Good.
      </Typography>

      {/* SVG Interactive Cave cross-section */}
      <Box style={{
        background: 'rgba(8, 12, 20, 0.75)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        position: 'relative',
        height: '420px',
        marginBottom: '20px'
      }}>
        <svg viewBox="0 0 560 240" width="100%" height="100%">
          {/* Gradients and Filters */}
          <defs>
            {/* Soft Gaussian blur for realistic shadows */}
            <filter id="shadowBlur" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.4" />
            </filter>

            {/* Firelight Projection Glow on Left Wall */}
            <radialGradient id="leftWallFireGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffb74d" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#f57c00" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#080c14" stopOpacity="0" />
            </radialGradient>

            {/* Fire glow gradient */}
            <radialGradient id="fireLightGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffb74d" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#f57c00" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#080c14" stopOpacity="0" />
            </radialGradient>

            {/* Sunlight rays */}
            <linearGradient id="sunRaysGrad" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fffde7" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#fff59d" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#fff59d" stopOpacity="0" />
            </linearGradient>

            {/* Outside Sky (Sunrise of Enlightenment) */}
            <linearGradient id="outsideSkyGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#ffe082" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#90caf9" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#42a5f5" stopOpacity="0.1" />
            </linearGradient>

            {/* Cave rock gradient */}
            <linearGradient id="rockGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#37474f" />
              <stop offset="60%" stopColor="#263238" />
              <stop offset="100%" stopColor="#1c2327" />
            </linearGradient>

            {/* Cave inner background shading */}
            <linearGradient id="caveBgGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#040608" />
              <stop offset="60%" stopColor="#0c0f15" />
              <stop offset="100%" stopColor="#1a222c" />
            </linearGradient>

            {/* Glowing Sun (Form of the Good) */}
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="25%" stopColor="#fff59d" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ffb74d" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Cave Background & Structure */}
          <rect x="0" y="0" width="410" height="240" fill="url(#caveBgGrad)" />

          {/* Outside Sky */}
          <rect x="410" y="0" width="150" height="240" fill="url(#outsideSkyGrad)" />
          
          {/* Sunlight rays streaming down the entrance */}
          <polygon points="505,50 330,190 420,210" fill="url(#sunRaysGrad)" opacity="0.4" />

          {/* Outside landscape: Grassy hill and river */}
          <path d="M 410,240 L 410,110 Q 480,95 560,110 L 560,240 Z" fill="#2e7d32" opacity="0.85" />
          <path d="M 410,180 Q 480,190 560,175 L 560,205 Q 480,220 410,210 Z" fill="#0288d1" opacity="0.85" />

          {/* Outside tree */}
          <g transform="translate(500, 60)" opacity={stage === 3 ? 1 : 0.35} style={{ transition: 'opacity 0.5s ease' }}>
            <rect x="18" y="25" width="4" height="25" fill="#4e342e" />
            <circle cx="20" cy="18" r="11" fill="#2e7d32" />
            <circle cx="13" cy="12" r="8" fill="#4caf50" />
            <circle cx="27" cy="12" r="8" fill="#4caf50" />
          </g>

          {/* Sun */}
          <circle cx="505" cy="50" r="40" fill="url(#sunGlow)" />
          <circle cx="505" cy="50" r="10" fill="#fff" />

          {/* Left Vertical Cave Wall (Enclosed rock face) */}
          <path d="M 0,0 L 15,0 Q 8,50 16,100 Q 6,150 14,200 L 0,200 Z" fill="url(#rockGrad)" />

          {/* Cave Ceiling with Stalactites */}
          <path d="M 0,0 L 420,0 Q 410,30 400,45 L 390,65 L 380,50 L 340,60 L 325,92 L 315,65 L 280,55 L 260,75 L 245,50 L 210,60 L 195,95 L 180,60 L 140,50 L 125,75 L 110,55 L 70,60 L 60,85 L 50,55 L 0,45 Z" fill="url(#rockGrad)" />
          
          {/* Cave Exit Arch (Mouth of the cave) */}
          <path d="M 395,0 C 405,35 400,75 408,100 C 398,135 402,175 418,240 L 430,240 C 418,175 415,135 422,100 C 418,75 422,35 430,0 Z" fill="url(#rockGrad)" />

          {/* Cave Floor Path with Stalagmites */}
          <path
            d="M 0,200 L 25,200 L 30,185 L 38,200 L 130,200 L 135,188 L 142,200 L 200,200 L 200,165 L 210,165 L 210,200 L 225,200 L 230,192 L 238,200 L 280,200 L 310,180 L 340,157 L 375,135 L 410,110 L 560,110 L 560,240 L 0,240 Z"
            fill="#1b2024"
            stroke="#2e3a40"
            strokeWidth="2"
          />
          <path d="M 0,200 L 200,200" stroke="#37474f" strokeWidth="1" fill="none" />
          <path d="M 210,200 L 280,200" stroke="#37474f" strokeWidth="1" fill="none" />
          <path d="M 280,200 L 310,180 L 340,157 L 375,135 L 410,110" stroke="#37474f" strokeWidth="1" fill="none" />
          <path d="M 410,110 L 560,110" stroke="#388e3c" strokeWidth="1.5" fill="none" />

          {/* Rocky Textures & Cracks */}
          <g stroke="#161c20" strokeWidth="0.75" fill="none" opacity="0.6">
            <path d="M 45,25 L 48,40 L 45,50" />
            <path d="M 160,20 L 163,35 Q 160,45 165,52" />
            <path d="M 280,20 L 285,42 L 280,50" />
            <path d="M 80,215 L 85,225" />
            <path d="M 255,215 L 258,228" />
            <path d="M 330,195 L 333,212" />
          </g>

          {/* Fire Light Glow */}
          <motion.circle
            cx="250" cy="180" r="80"
            fill="url(#fireLightGlow)"
            animate={{ opacity: stage >= 1 ? [0.85, 0.95, 0.8, 0.92, 0.85] : [0.35, 0.42, 0.38, 0.45, 0.35] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />

          {/* Fire Pit (Stone barrier) */}
          <path d="M 226,200 Q 250,210 274,200 Z" fill="#212529" stroke="#37474f" strokeWidth="1.5" />

          {/* The Fire */}
          <g transform="translate(240, 178)">
            {/* Logs */}
            <line x1="0" y1="20" x2="20" y2="12" stroke="#4e342e" strokeWidth="3" strokeLinecap="round" />
            <line x1="20" y1="20" x2="0" y2="12" stroke="#3e2723" strokeWidth="3" strokeLinecap="round" />
            {/* Flames */}
            <motion.path
              d="M 5,18 Q 10, -2 15,18 Q 20,4 10,23 Z"
              fill="#ff5722"
              animate={{ scaleY: [1, 1.25, 0.9, 1.15, 1], y: [0, -2, 1, -1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
            <motion.path
              d="M 8,18 Q 10,5 12,18 Q 14,8 10,21 Z"
              fill="#ffeb3b"
              animate={{ scaleY: [1, 1.35, 0.8, 1.25, 1], y: [0, -3, 2, -1, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.2 }}
            />
          </g>

          {/* Firelight Projection Glow on Left Wall */}
          <motion.ellipse
            cx="28" cy="115" rx="20" ry="45"
            fill="url(#leftWallFireGlow)"
            animate={{ opacity: stage === 0 ? [0.8, 0.9, 0.75, 0.85, 0.8] : [0.15, 0.18, 0.14, 0.17, 0.15] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />

          {/* Shadows on the left wall (x=20) */}
          <g filter="url(#shadowBlur)" opacity={stage === 0 ? 0.95 : 0.15} style={{ transition: 'opacity 0.5s ease' }}>
            {/* Bird Shadow - Clean Wings Spread Silhouette */}
            <motion.path
              d="M 28,82 Q 22,78 15,82 Q 22,86 25,90 Q 20,96 16,102 Q 24,96 28,92 Q 32,96 40,102 Q 36,96 31,90 Q 34,86 41,82 Q 34,78 28,82 Z"
              fill="#000000"
              animate={stage === 0 ? { y: [0, -3, 2, -1, 0], x: [0, 1, -1, 0, 0] } : {}}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
            {/* Vase Shadow - Unified Classical Urn Shape */}
            <path d="M 22,118 C 22,114 25,113 28,113 C 31,113 34,114 34,118 C 34,123 38,127 38,136 C 38,142 34,145 28,145 C 22,145 18,142 18,136 C 18,127 22,123 22,118 Z" fill="#000000" />
          </g>

          {/* Puppets held by Puppeteers behind the wall */}
          <g opacity={stage >= 1 ? 0.95 : 0.35} style={{ transition: 'opacity 0.5s ease' }}>
            {/* Puppeteer wall */}
            <rect x="140" y="195" width="60" height="8" fill="#795548" rx="1.5" />
            <line x1="150" y1="200" x2="150" y2="240" stroke="#795548" strokeWidth="1.5" />
            <line x1="190" y1="200" x2="190" y2="240" stroke="#795548" strokeWidth="1.5" />

            {/* Stick with bird puppet */}
            <line x1="170" y1="185" x2="170" y2="145" stroke="#a1887f" strokeWidth="1.5" />
            <path d="M 170,137 Q 164,133 157,137 Q 164,141 167,145 Q 162,151 158,157 Q 166,151 170,147 Q 174,151 182,157 Q 178,151 173,145 Q 176,141 183,137 Q 176,133 170,137 Z" fill="#8d6e63" stroke="#5d4037" strokeWidth="0.5" />
            
            {/* Stick with vase puppet */}
            <line x1="185" y1="190" x2="185" y2="155" stroke="#a1887f" strokeWidth="1.5" />
            <path d="M 179,128 C 179,124 182,123 185,123 C 188,123 191,124 191,128 C 191,133 195,137 195,146 C 195,152 191,155 185,155 C 179,155 175,152 175,146 C 175,137 179,133 179,128 Z" fill="#8d6e63" stroke="#5d4037" strokeWidth="0.5" />
          </g>

          {/* The Escapee's Chains */}
          {stage === 0 ? (
            <g stroke="#90a4ae" strokeWidth="1.5" fill="none" opacity="0.8">
              <path d="M 85,185 C 75,185 70,195 60,195" />
              <circle cx="70" cy="190" r="2.5" />
              <circle cx="78" cy="188" r="2.5" />
            </g>
          ) : stage === 1 ? (
            <g stroke="#90a4ae" strokeWidth="1.2" fill="none" opacity="0.4">
              <path d="M 60,198 Q 70,202 80,198" />
              <circle cx="70" cy="199" r="1.5" />
            </g>
          ) : null}

          {/* The Traveler (Prisoner) */}
          <motion.g
            animate={{
              x: currentStage.travelerX,
              y: currentStage.travelerY
            }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          >
            {/* Glow effect */}
            <circle cx="0" cy="0" r="11" fill={currentStage.chains ? "rgba(255, 152, 0, 0.2)" : "rgba(0, 230, 118, 0.3)"} />
            
            {/* Person Figure */}
            <circle cx="0" cy="-14" r="4.5" fill={currentStage.chains ? "#ffa726" : "#26a69a"} />
            <line x1="0" y1="-9" x2="0" y2="2" stroke={currentStage.chains ? "#ffa726" : "#26a69a"} strokeWidth="2.5" strokeLinecap="round" />
            {currentStage.facing === 'left' ? (
              <path d="M -6,-7 Q -2,-5 0,-7" stroke={currentStage.chains ? "#ffa726" : "#26a69a"} strokeWidth="2" strokeLinecap="round" fill="none" />
            ) : stage === 3 ? (
              <path d="M -5,-17 L 0,-9 L 5,-17" stroke="#26a69a" strokeWidth="2" strokeLinecap="round" fill="none" />
            ) : stage === 2 ? (
              <path d="M -4,-9 L 1,-16 L 5,-12" stroke="#26a69a" strokeWidth="2" strokeLinecap="round" fill="none" />
            ) : (
              <path d="M -4,-5 Q 0,-3 4,-5" stroke={currentStage.chains ? "#ffa726" : "#26a69a"} strokeWidth="2" strokeLinecap="round" fill="none" />
            )}
            <line x1="0" y1="2" x2="-4" y2="12" stroke={currentStage.chains ? "#ffa726" : "#26a69a"} strokeWidth="2" strokeLinecap="round" />
            <line x1="0" y1="2" x2="4" y2="12" stroke={currentStage.chains ? "#ffa726" : "#26a69a"} strokeWidth="2" strokeLinecap="round" />
          </motion.g>

          {/* Interactive Speech Bubbles */}
          {stage === 0 && (
            <g transform="translate(90, 125)">
              <rect x="0" y="0" width="110" height="32" rx="5" fill="rgba(255, 255, 255, 0.95)" stroke="#ffa726" strokeWidth="1.5" />
              <polygon points="15,32 10,38 20,32" fill="rgba(255, 255, 255, 0.95)" stroke="#ffa726" strokeWidth="1.5" />
              <polygon points="14,31 11,37 19,31" fill="rgba(255, 255, 255, 0.95)" />
              <text x="8" y="13" fill="#111" fontSize="8" fontWeight="bold">"A flying shadow!"</text>
              <text x="8" y="24" fill="#e65100" fontSize="7" fontWeight="bold">Sensory Illusion (Eikasia)</text>
            </g>
          )}
          {stage === 1 && (
            <g transform="translate(40, 115)">
              <rect x="0" y="0" width="120" height="32" rx="5" fill="rgba(255, 255, 255, 0.95)" stroke="#26a69a" strokeWidth="1.5" />
              <polygon points="105,32 110,38 115,32" fill="rgba(255, 255, 255, 0.95)" stroke="#26a69a" strokeWidth="1.5" />
              <polygon points="104,31 110,37 114,31" fill="rgba(255, 255, 255, 0.95)" />
              <text x="8" y="13" fill="#111" fontSize="8" fontWeight="bold">"It's just wooden puppets!"</text>
              <text x="8" y="24" fill="#00796b" fontSize="7" fontWeight="bold">Common Belief (Pistis)</text>
            </g>
          )}
          {stage === 2 && (
            <g transform="translate(225, 85)">
              <rect x="0" y="0" width="110" height="32" rx="5" fill="rgba(255, 255, 255, 0.95)" stroke="#26a69a" strokeWidth="1.5" />
              <polygon points="50,32 55,38 60,32" fill="rgba(255, 255, 255, 0.95)" stroke="#26a69a" strokeWidth="1.5" />
              <polygon points="51,31 54,37 59,31" fill="rgba(255, 255, 255, 0.95)" />
              <text x="8" y="13" fill="#111" fontSize="8" fontWeight="bold">"The light is blinding..."</text>
              <text x="8" y="24" fill="#00796b" fontSize="7" fontWeight="bold">Reasoning (Dianoia)</text>
            </g>
          )}
          {stage === 3 && (
            <g transform="translate(415, 130)">
              <rect x="0" y="0" width="120" height="32" rx="5" fill="rgba(255, 255, 255, 0.95)" stroke="#00e676" strokeWidth="1.5" />
              <polygon points="55,32 60,38 65,32" fill="rgba(255, 255, 255, 0.95)" stroke="#00e676" strokeWidth="1.5" />
              <polygon points="56,31 59,37 64,31" fill="rgba(255, 255, 255, 0.95)" />
              <text x="8" y="13" fill="#111" fontSize="8" fontWeight="bold">"The Sun! The source!"</text>
              <text x="8" y="24" fill="#00c853" fontSize="7" fontWeight="bold">Intellect (Noesis)</text>
            </g>
          )}

          {/* Explanatory Text Overlays */}
          <text x="35" y="225" fontSize="9" fill="rgba(255,255,255,0.4)" fontWeight="bold">1. Shadows</text>
          <text x="195" y="225" fontSize="9" fill="rgba(255,255,255,0.4)" fontWeight="bold">2. Puppets</text>
          <text x="320" y="225" fontSize="9" fill="rgba(255,255,255,0.4)" fontWeight="bold">3. The Slope</text>
          <text x="460" y="225" fontSize="9" fill="rgba(255,255,255,0.4)" fontWeight="bold">4. The Sun</text>
        </svg>
      </Box>

      {/* Controls */}
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Button
          variant="outlined"
          onClick={handlePrev}
          disabled={stage === 0}
          style={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 800,
            borderColor: 'rgba(128,128,128,0.25)',
            color: stage === 0 ? 'var(--text-secondary)' : 'var(--text-primary)'
          }}
        >
          Previous Stage
        </Button>

        <Typography variant="caption" style={{ color: 'var(--text-secondary)', fontWeight: 800 }}>
          Stage {stage + 1} of 4
        </Typography>

        <Button
          variant="contained"
          onClick={handleNext}
          disabled={stage === 3}
          style={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 800,
            background: stage === 3 ? 'var(--text-disabled)' : 'var(--primary-main)',
            color: '#fff'
          }}
        >
          {stage === 3 ? "Fully Enlightened" : "Next Stage"}
        </Button>
      </Box>

      {/* Narrative & Insight Card */}
      <Box style={{
        padding: '20px',
        background: 'rgba(128,128,128,0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(128,128,128,0.15)',
        marginBottom: '20px'
      }}>
        <Typography variant="subtitle1" style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {currentStage.title}
        </Typography>

        <Typography variant="body2" style={{ color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '14px' }}>
          {currentStage.description}
        </Typography>

        <Box style={{
          padding: '12px 16px',
          background: 'rgba(74, 144, 226, 0.08)',
          borderLeft: '4px solid var(--primary-main)',
          borderRadius: '4px'
        }}>
          <Typography variant="caption" style={{ fontWeight: 800, color: 'var(--primary-main)', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>
            Philosophical Significance
          </Typography>
          <Typography variant="body2" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontStyle: 'italic' }}>
            {currentStage.insight}
          </Typography>
        </Box>
      </Box>

      {/* Reflection Interactive */}
      {stage === 3 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Box style={{
            padding: '20px',
            background: 'rgba(0, 230, 118, 0.05)',
            border: '1.5px solid #26a69a',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <Typography variant="subtitle2" style={{ fontWeight: 800, color: '#26a69a', marginBottom: '8px' }}>
              👥 The Return: Plato's Tragic Conclusion
            </Typography>
            <Typography variant="body2" style={{ color: 'var(--text-primary)', marginBottom: '14px', lineHeight: 1.4 }}>
              Plato asserts that the enlightened philosopher must return to the cave to lead others out. If you go back down and try to tell the chained prisoners that their shadows are illusions, how will they react?
            </Typography>

            <Grid container spacing={2}>
              {[
                { key: 'A', text: "They will be grateful and follow you out immediately." },
                { key: 'B', text: "They will think you are crazy, laugh at you, and kill you if you try to free them." },
                { key: 'C', text: "They will ignore you, preferring their familiar illusions." }
              ].map(opt => (
                <Grid item xs={12} key={opt.key}>
                  <Button
                    fullWidth
                    variant={userChoice === opt.key ? "contained" : "outlined"}
                    onClick={() => setUserChoice(opt.key)}
                    style={{
                      textTransform: 'none',
                      justifyContent: 'flex-start',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontWeight: 800,
                      borderColor: userChoice === opt.key ? '#26a69a' : 'rgba(128,128,128,0.25)',
                      backgroundColor: userChoice === opt.key ? 'rgba(38, 166, 154, 0.15)' : 'transparent',
                      color: userChoice === opt.key ? '#26a69a' : 'var(--text-primary)'
                    }}
                  >
                    {opt.text}
                  </Button>
                </Grid>
              ))}
            </Grid>

            {userChoice && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '16px' }}>
                <Divider style={{ margin: '12px 0', borderColor: 'rgba(38, 166, 154, 0.2)' }} />
                <Typography variant="body2" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  {userChoice === 'B' ? (
                    <span>
                      <b>Correct (According to Plato).</b> In the dialogue, Socrates notes that the prisoners would ridicule the returning philosopher because his eyes are no longer adjusted to the dark. They would claim that ascending ruins one's eyesight, and if anyone tried to set them free, they would put him to death—a clear reference to the execution of Socrates.
                    </span>
                  ) : (
                    <span>
                      <b>Plato's view is darker:</b> He argued they would choose <b>B</b>. The prisoners do not want to be freed. Because they have known only shadows, they fear the light and would consider the philosopher ruined and mad. Plato used this to illustrate how society rejects true wisdom.
                    </span>
                  )}
                  <br /><br />
                  This leads to Plato's concept of the <b>Philosopher King</b>: only those who have seen the Sun (the Truth) are fit to rule, yet they must be compelled to rule because they would prefer to stay outside in the sunlight.
                </Typography>
              </motion.div>
            )}
          </Box>
        </motion.div>
      )}
    </Paper>
  );
};

// 7. Political Compass Widget (Politics Test - 4 Quadrants & Live Plotting)
export const PoliticalCompassWidget = () => {
  const [answers, setAnswers] = useState(() => {
    const init = {};
    for (let i = 1; i <= 15; i++) init[i] = null;
    return init;
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = [
    {
      id: 1,
      text: "The state must actively intervene in the economy to regulate corporations, protect labor rights, and redistribute wealth.",
      axis: 'economic',
      weight: -1 // Agree moves Left (-)
    },
    {
      id: 2,
      text: "For the sake of public safety, order, and national security, the government must have strong surveillance authority and restrict harmful speech.",
      axis: 'social',
      weight: 1 // Agree moves Authoritarian (+)
    },
    {
      id: 3,
      text: "Unregulated free-market capitalism, with flat or minimal taxation, is the most efficient and moral way to organize a society.",
      axis: 'economic',
      weight: 1 // Agree moves Right (+)
    },
    {
      id: 4,
      text: "Personal lifestyle liberties (such as drug choices, consensual relationships, and self-expression) should be absolute and completely free from government legislation.",
      axis: 'social',
      weight: -1 // Agree moves Libertarian (-)
    },
    {
      id: 5,
      text: "Vital services like healthcare, university education, and housing are human rights that must be funded by progressive taxes and guaranteed by the state.",
      axis: 'economic',
      weight: -1 // Agree moves Left (-)
    },
    {
      id: 6,
      text: "National sovereignty, strict control of borders, and the preservation of traditional cultural values must be prioritized over cosmopolitan globalism.",
      axis: 'social',
      weight: 1 // Agree moves Authoritarian (+)
    },
    {
      id: 7,
      text: "Heavy inheritance taxes are necessary to prevent the concentration of wealth and ensure a fairer starting line for all citizens.",
      axis: 'economic',
      weight: -1 // Agree moves Left (-)
    },
    {
      id: 8,
      text: "Infrastructure such as highways, railways, and utility grids are more efficiently managed when owned and operated by private enterprises.",
      axis: 'economic',
      weight: 1 // Agree moves Right (+)
    },
    {
      id: 9,
      text: "Absolute freedom of speech must be protected, even for ideas that are widely considered offensive, sacrilegious, or dangerous.",
      axis: 'social',
      weight: -1 // Agree moves Libertarian (-)
    },
    {
      id: 10,
      text: "A government should have the authority to implement mandatory national or community service for young adults.",
      axis: 'social',
      weight: 1 // Agree moves Authoritarian (+)
    },
    {
      id: 11,
      text: "The primary goal of the criminal justice system should be rehabilitation rather than punitive retribution or deterrence.",
      axis: 'social',
      weight: -1 // Agree moves Libertarian (-)
    },
    {
      id: 12,
      text: "The state should actively promote moral and traditional family values in public school curriculums.",
      axis: 'social',
      weight: 1 // Agree moves Authoritarian (+)
    },
    {
      id: 13,
      text: "Strong labor unions are essential for balancing corporate power, and the state should legally protect and promote union membership.",
      axis: 'economic',
      weight: -1 // Agree moves Left (-)
    },
    {
      id: 14,
      text: "International trade barriers, protective tariffs, and economic protectionism should be abolished to maximize global market efficiency.",
      axis: 'economic',
      weight: 1 // Agree moves Right (+)
    },
    {
      id: 15,
      text: "In times of severe national crisis or emergency, individual rights and liberties must be temporarily suspended for the common good.",
      axis: 'social',
      weight: 1 // Agree moves Authoritarian (+)
    }
  ];

  const handleAnswer = (scoreValue) => {
    setAnswers(prev => ({ ...prev, [questions[currentIdx].id]: scoreValue }));
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setFinished(false);
    }
  };

  const handleReset = () => {
    setAnswers(() => {
      const init = {};
      for (let i = 1; i <= 15; i++) init[i] = null;
      return init;
    });
    setCurrentIdx(0);
    setFinished(false);
  };

  // Calculate coordinates dynamically based on answered questions
  const calculateCoordinates = () => {
    let xSum = 0;
    let ySum = 0;
    let xCount = 0;
    let yCount = 0;

    questions.forEach(q => {
      const val = answers[q.id];
      if (val !== null) {
        if (q.axis === 'economic') {
          xSum += val * q.weight;
          xCount++;
        } else {
          ySum += val * q.weight;
          yCount++;
        }
      }
    });

    // Scale to -10 to +10 range
    // val is in [-2, +2], max possible sum for a question is 2 * weight.
    const x = xCount > 0 ? (xSum / (xCount * 2)) * 10 : 0;
    const y = yCount > 0 ? (ySum / (yCount * 2)) * 10 : 0;

    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  };

  const { x, y } = calculateCoordinates();

  const getAlignment = (x, y) => {
    if (Math.abs(x) <= 2.2 && Math.abs(y) <= 2.2) {
      return {
        title: "Social Liberalism / Center-Left Social Democracy",
        desc: "You prioritize individual rights and democratic processes, believing in a mixed economy where the market drives growth but regulations and safety nets prevent exploitation.",
        philosophers: "John Rawls, John Stuart Mill, John Maynard Keynes",
        color: "var(--primary-main)"
      };
    }
    if (x < -2.2 && y > 2.2) {
      return {
        title: "Democratic Socialism / Marxism",
        desc: "You favor progressive economic control, state-led welfare, and heavy regulations to achieve class equality. You support state authority in managing key sectors of life.",
        philosophers: "Karl Marx, Rosa Luxemburg, Clement Attlee",
        color: "#FF4B4B"
      };
    }
    if (x > 2.2 && y > 2.2) {
      return {
        title: "Authoritarian Capitalism / Classical Conservatism",
        desc: "You value national sovereignty, order, and traditional morals. Economically, you favor private ownership and capitalist structures, believing government should enforce social stability.",
        philosophers: "Thomas Hobbes, Edmund Burke, Alexander Hamilton",
        color: "#4B7BFF"
      };
    }
    if (x < -2.2 && y < -2.2) {
      return {
        title: "Libertarian Socialism / Anarcho-Syndicalism",
        desc: "You advocate for absolute personal liberty, social freedom, and community ownership. You reject corporate hierarchy and state coercion, favoring decentralized worker cooperatives.",
        philosophers: "Mikhail Bakunin, Peter Kropotkin, Noam Chomsky",
        color: "#4BFF7B"
      };
    }
    if (x > 2.2 && y < -2.2) {
      return {
        title: "Classical Liberalism / Minarchism / Libertarianism",
        desc: "You advocate for a 'night-watchman state' limited exclusively to protecting life, property, and freedom of contract. You believe in unfettered free markets and private solutions.",
        philosophers: "John Locke, Robert Nozick, Adam Smith, Friedrich Hayek",
        color: "#B44BFF"
      };
    }
    if (x < -2.2) {
      return {
        title: "Left-Wing Populism / Social Equality Focus",
        desc: "You prioritize social rights and wealth redistribution. You believe in checks against corporate capitalism and support collective labor representation.",
        philosophers: "Jean-Jacques Rousseau, Thomas Paine",
        color: "#FFA726"
      };
    }
    if (x > 2.2) {
      return {
        title: "Market Liberalism / Neoliberalism",
        desc: "You strongly advocate for privatization, deregulation, free trade, and fiscal conservatism. You trust market competition to allocate resources efficiently.",
        philosophers: "Milton Friedman, Ayn Rand",
        color: "#26C6DA"
      };
    }
    if (y > 2.2) {
      return {
        title: "Communitarianism / Traditionalism",
        desc: "You believe that communities, civil duties, and shared cultural values are paramount. You support state support for public ethics and social cohesion.",
        philosophers: "Plato, Aristotle, Alasdair MacIntyre",
        color: "#AB47BC"
      };
    }
    return {
      title: "Left-Libertarian / Georgism",
      desc: "You believe in broad personal liberties and land/resource sharing, seeking to balance individual ownership of wealth with social stewardship of natural resources.",
      philosophers: "Henry George, Pierre-Joseph Proudhon",
      color: "#26A69A"
    };
  };

  const alignment = getAlignment(x, y);

  return (
    <Paper className="glass-panel" style={{ padding: '24px', margin: '20px 0', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Typography variant="subtitle2" style={{ fontWeight: 800, color: 'var(--primary-main)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Politics Lab: The Political Compass
      </Typography>

      <Typography variant="body2" style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.4 }}>
        Philosophers have long debated the proper balance between **state authority vs. individual liberty** (Social) and 
        **market capitalism vs. collective welfare** (Economic). Take this enhanced 15-question test to plot your coordinates.
      </Typography>

      <Grid container spacing={3} alignItems="center">
        {/* Left Side: The 2D Compass Graph */}
        <Grid item xs={12} sm={5} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box style={{ position: 'relative', width: '380px', height: '380px', background: 'transparent', borderRadius: '8px', overflow: 'visible', padding: '10px' }}>
            <svg viewBox="0 0 240 240" width="100%" height="100%">
              {/* Quadrant Backgrounds */}
              {/* Top-Left: Auth-Left (Red) */}
              <rect x="10" y="10" width="110" height="110" fill="rgba(239, 83, 80, 0.14)" stroke="rgba(239, 83, 80, 0.3)" strokeWidth="0.75" />
              {/* Top-Right: Auth-Right (Blue) */}
              <rect x="120" y="10" width="110" height="110" fill="rgba(41, 182, 246, 0.14)" stroke="rgba(41, 182, 246, 0.3)" strokeWidth="0.75" />
              {/* Bottom-Left: Lib-Left (Green) */}
              <rect x="10" y="120" width="110" height="110" fill="rgba(102, 187, 106, 0.14)" stroke="rgba(102, 187, 106, 0.3)" strokeWidth="0.75" />
              {/* Bottom-Right: Lib-Right (Purple) */}
              <rect x="120" y="120" width="110" height="110" fill="rgba(171, 71, 188, 0.14)" stroke="rgba(171, 71, 188, 0.3)" strokeWidth="0.75" />

              {/* Concentric rings to make it look highly analytical */}
              <circle cx="120" cy="120" r="33" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <circle cx="120" cy="120" r="66" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <circle cx="120" cy="120" r="99" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

              {/* Sub-grid lines */}
              <line x1="65" y1="10" x2="65" y2="230" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="175" y1="10" x2="175" y2="230" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="10" y1="65" x2="230" y2="65" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="10" y1="175" x2="230" y2="175" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="2,2" />

              {/* Major axes */}
              <line x1="120" y1="10" x2="120" y2="230" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
              <line x1="10" y1="120" x2="230" y2="120" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

              {/* Crosshair projections */}
              {(finished || currentIdx > 0) && (
                <g>
                  <line x1="120" y1={120 - (y / 10) * 110} x2={120 + (x / 10) * 110} y2={120 - (y / 10) * 110} stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeDasharray="3,3" />
                  <line x1={120 + (x / 10) * 110} y1="120" x2={120 + (x / 10) * 110} y2={120 - (y / 10) * 110} stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeDasharray="3,3" />
                </g>
              )}

              {/* Pulsing halo around the dot when finished */}
              {finished && (
                <motion.circle
                  cx={120 + (x / 10) * 110}
                  cy={120 - (y / 10) * 110}
                  r="14"
                  fill="none"
                  stroke={alignment.color}
                  strokeWidth="1.5"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                />
              )}

              {/* Current Plotted Dot */}
              <motion.circle
                cx={120 + (x / 10) * 110}
                cy={120 - (y / 10) * 110}
                r="6.5"
                fill={finished ? alignment.color : "#FF5252"}
                stroke="#fff"
                strokeWidth="1.8"
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 0.3 }}
                style={{ filter: `drop-shadow(0 0 5px ${finished ? alignment.color : '#ff5252'})` }}
              />

              {/* Labels overlay inside SVG */}
              <text x="120" y="8" fill="var(--text-secondary)" fontSize="6" fontWeight="900" textAnchor="middle">AUTHORITARIAN</text>
              <text x="120" y="238" fill="var(--text-secondary)" fontSize="6" fontWeight="900" textAnchor="middle">LIBERTARIAN</text>
              <text x="8" y="122" fill="var(--text-secondary)" fontSize="6" fontWeight="900" textAnchor="start">LEFT</text>
              <text x="232" y="122" fill="var(--text-secondary)" fontSize="6" fontWeight="900" textAnchor="end">RIGHT</text>
            </svg>
          </Box>
          <Typography variant="caption" style={{ color: 'var(--text-secondary)', fontWeight: 800, marginTop: '8px' }}>
            Coordinates: X = {x > 0 ? `+${x}` : x} (Econ) | Y = {y > 0 ? `+${y}` : y} (Social)
          </Typography>
        </Grid>

        {/* Right Side: The Questions / Results */}
        <Grid item xs={12} sm={7}>
          {!finished ? (
            <Box style={{ padding: '18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Typography variant="caption" style={{ color: 'var(--primary-main)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Statement {currentIdx + 1} of {questions.length}
                  </Typography>
                  <Typography variant="caption" style={{ color: 'var(--text-secondary)', fontWeight: 800 }}>
                    {Math.round((currentIdx / questions.length) * 100)}% Complete
                  </Typography>
                </Box>
                
                <LinearProgress 
                  variant="determinate" 
                  value={(currentIdx / questions.length) * 100} 
                  sx={{ 
                    height: 5, 
                    borderRadius: 3, 
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, var(--primary-main) 0%, #26C6DA 100%)',
                      borderRadius: 3},
                    mb: 2.5
                  }} 
                />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIdx}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Typography variant="body2" style={{ fontWeight: 800, color: 'var(--text-primary)', minHeight: '54px', mb: 2.5, lineHeight: 1.5, fontSize: '0.94rem' }}>
                      "{questions[currentIdx].text}"
                    </Typography>
                  </motion.div>
                </AnimatePresence>
              </Box>

              <Box>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Button 
                    size="small"
                    variant="outlined" 
                    onClick={() => handleAnswer(2)} 
                    style={{ 
                      textTransform: 'none', 
                      borderRadius: '10px', 
                      color: '#4CAF50', 
                      borderColor: 'rgba(76,175,80,0.3)', 
                      background: 'rgba(76,175,80,0.03)',
                      fontWeight: 800, 
                      fontSize: '0.8rem',
                      justifyContent: 'flex-start',
                      padding: '8px 16px'
                    }}
                  >
                    🟢 Strongly Agree
                  </Button>
                  <Button 
                    size="small"
                    variant="outlined" 
                    onClick={() => handleAnswer(1)} 
                    style={{ 
                      textTransform: 'none', 
                      borderRadius: '10px', 
                      color: '#81C784', 
                      borderColor: 'rgba(129,199,132,0.3)', 
                      background: 'rgba(129,199,132,0.03)',
                      fontWeight: 800, 
                      fontSize: '0.8rem',
                      justifyContent: 'flex-start',
                      padding: '8px 16px'
                    }}
                  >
                    ✅ Agree
                  </Button>
                  <Button 
                    size="small"
                    variant="outlined" 
                    onClick={() => handleAnswer(0)} 
                    style={{ 
                      textTransform: 'none', 
                      borderRadius: '10px', 
                      color: '#90A4AE', 
                      borderColor: 'rgba(144,164,174,0.3)', 
                      background: 'rgba(144,164,174,0.03)',
                      fontWeight: 800, 
                      fontSize: '0.8rem',
                      justifyContent: 'flex-start',
                      padding: '8px 16px'
                    }}
                  >
                    ⚪ Neutral / Unsure
                  </Button>
                  <Button 
                    size="small"
                    variant="outlined" 
                    onClick={() => handleAnswer(-1)} 
                    style={{ 
                      textTransform: 'none', 
                      borderRadius: '10px', 
                      color: '#E57373', 
                      borderColor: 'rgba(229,115,115,0.3)', 
                      background: 'rgba(229,115,115,0.03)',
                      fontWeight: 800, 
                      fontSize: '0.8rem',
                      justifyContent: 'flex-start',
                      padding: '8px 16px'
                    }}
                  >
                    ❌ Disagree
                  </Button>
                  <Button 
                    size="small"
                    variant="outlined" 
                    onClick={() => handleAnswer(-2)} 
                    style={{ 
                      textTransform: 'none', 
                      borderRadius: '10px', 
                      color: '#FF5252', 
                      borderColor: 'rgba(255,82,82,0.3)', 
                      background: 'rgba(255,82,82,0.03)',
                      fontWeight: 800, 
                      fontSize: '0.8rem',
                      justifyContent: 'flex-start',
                      padding: '8px 16px'
                    }}
                  >
                    🛑 Strongly Disagree
                  </Button>
                </Box>

                {currentIdx > 0 && (
                  <Button size="small" onClick={handleBack} style={{ textTransform: 'none', color: 'var(--text-secondary)', marginTop: '12px', display: 'block', margin: '12px auto 0 auto', fontWeight: 800 }}>
                    ← Back to Previous Statement
                  </Button>
                )}
              </Box>
            </Box>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Box style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1.5px solid', borderColor: alignment.color, borderRadius: '14px', minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" style={{ color: alignment.color, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Your Political Philosophy Alignment
                  </Typography>
                  <Typography variant="subtitle1" style={{ fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px', marginBottom: '8px', fontSize: '1.1rem' }}>
                    {alignment.title}
                  </Typography>
                  <Typography variant="body2" style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.5, marginBottom: '16px' }}>
                    {alignment.desc}
                  </Typography>
                </Box>

                <Box>
                  <Divider style={{ backgroundColor: 'rgba(255,255,255,0.06)', margin: '12px 0' }} />
                  <Typography variant="caption" style={{ color: 'var(--text-primary)', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                    Associated Philosophers:
                  </Typography>
                  <Typography variant="caption" style={{ color: 'var(--primary-main)', fontWeight: 800, fontSize: '0.84rem' }}>
                    {alignment.philosophers}
                  </Typography>
                </Box>
              </Box>
              
              <Button
                variant="outlined"
                onClick={handleReset}
                size="small"
                style={{
                  borderColor: 'rgba(255,255,255,0.15)',
                  color: 'var(--text-primary)',
                  fontWeight: 800,
                  borderRadius: '10px',
                  textTransform: 'none',
                  marginTop: '14px',
                  padding: '6px 16px'
                }}
              >
                Retake Compass Test
              </Button>
            </motion.div>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

// Main Philosophy Lab Page
const PhilosophyLabPage = () => {
  return (
    <BiggerScreenRequired pageName="The Philosophy Lab">
      <PhilosophyLabContent />
    </BiggerScreenRequired>
  );
};

const PhilosophyLabContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return tabParam ? Number(tabParam) : 0;
  });
  const navigate = useNavigate();

  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab, setSearchParams]);

  const handleBack = () => {
    navigate(-1);
  };

  const tabsData = [
    { label: 'Socratic Dialogue', icon: <SchoolIcon sx={{ fontSize: 18 }} />, component: <SocraticDialogueWidget /> },
    { label: 'Fallacy Matcher', icon: <HelpOutlineIcon sx={{ fontSize: 18 }} />, component: <FallacySorterWidget /> },
    { label: 'Ship of Theseus', icon: <BookIcon sx={{ fontSize: 18 }} />, component: <ShipOfTheseusWidget /> },
    { label: 'Trolley Problem', icon: <PlayIcon sx={{ fontSize: 18 }} />, component: <TrolleyProblemWidget /> },
    { label: "Plato's Cave", icon: <PsychologyIcon sx={{ fontSize: 18 }} />, component: <PlatosCaveWidget /> },
    { label: 'Political Compass', icon: <ExploreIcon sx={{ fontSize: 18 }} />, component: <PoliticalCompassWidget /> },
    { label: 'Religion Tree Map', icon: <AccountTreeIcon sx={{ fontSize: 18 }} />, component: <ReligionTreeMap /> }
  ];

  return (
    <Box className="learning-content-page" style={{ minHeight: 'auto', padding: '24px 0', background: 'var(--background-default)' }}>
      <Container style={{ maxWidth: '1600px', width: '95%' }}>
        
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            style={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 800,
              color: 'var(--text-primary)',
              borderColor: 'rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.01)',
              fontFamily: '"Outfit", sans-serif'
            }}
          >
            Back to Roadmap
          </Button>

          <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AutoAwesomeIcon style={{ color: 'var(--primary-main)' }} />
            <Typography variant="h6" style={{ fontWeight: 900, fontFamily: '"Outfit", sans-serif', color: 'var(--text-primary)' }}>
              Interactive Philosophy Lab
            </Typography>
          </Box>
        </Box>

        {/* Tab Selection */}
        <Box className="path-sections-tabs glass-panel" sx={{ mb: 3, borderRadius: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 2 }}
          >
            {tabsData.map((tab, idx) => (
              <Tab
                key={idx}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, textTransform: 'none', fontWeight: 800 }}>
                    {tab.icon}
                    {tab.label}
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        {/* Widget Viewport */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {tabsData[activeTab].component}
          </motion.div>
        </AnimatePresence>

      </Container>
    </Box>
  );
};

export default PhilosophyLabPage;

